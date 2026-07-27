import { getPyodide, type PyodideInterface, type PyProxy } from './pyodideClient';
import { ensureDataSciencePackages } from './dataScience';

export type RunResult = {
  stdout: string;
  stderr: string;
  error: string | null;
  // Gráficos de matplotlib capturados como PNG en base64 (sin el prefijo
  // data:). Solo se llenan cuando se pide dataScience: true.
  images?: string[];
};

export type FunctionTestCase = { args: unknown[]; expected: unknown };

export type FunctionTestResult = {
  passed: boolean;
  error: string | null;
  cases: { args: unknown[]; expected: unknown; actual: unknown; passed: boolean }[];
};

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

// Todo esto corre en el hilo principal del navegador (no hay Web Worker
// todavía), así que un while sin actualizar la condición congelaría la
// pestaña para siempre. sys.settrace se dispara en cada línea ejecutada,
// incluso dentro de un bucle infinito, así que sirve de límite duro.
//
// La primera versión de este guard contaba PASOS (líneas rastreadas) en vez
// de tiempo, con un tope bajo (5,000) pensado solo para scripts cortos. Eso
// resultó frágil de una forma no obvia: sys.settrace también rastrea la
// COMPILACIÓN del código del alumno (Pyodide compila vía ast.fix_missing_locations,
// una función recursiva), no solo su ejecución — así que un ejercicio con
// varias funciones, o con un bucle explícito en vez de sum()/max(), podía
// gastar el presupuesto entero antes de ejecutar una sola línea del alumno,
// marcando como "bucle infinito" código perfectamente correcto. Con pandas
// el mismo problema aparece todavía peor (un groupby trivial ya pasa los
// 5,000 pasos).
//
// Por eso se mide tiempo real transcurrido en su lugar, revisando el reloj
// cada TIME_CHECK_EVERY pasos rastreados (no en cada uno, para no sumar el
// costo de time.time() a cada línea) — desacopla "cuántas líneas de código
// interno se ejecutaron" de "cuánto tardó de verdad", que es lo que
// realmente importa para no trabar el navegador. Verificado con Python real:
// compilar y correr un ejercicio típico (incluso con varias funciones o
// pandas) tarda milisegundos; un bucle infinito real se corta justo a los
// MAX_SECONDS.
const MAX_SECONDS = 3;
const TIME_CHECK_EVERY = 2_000;

function buildGuardSetup(): string {
  return [
    'import sys as _pyodide_sys',
    'import time as _pyodide_time',
    '_pyodide_start_time = _pyodide_time.time()',
    '_pyodide_step_count = [0]',
    `_pyodide_max_seconds = ${MAX_SECONDS}`,
    `_pyodide_check_every = ${TIME_CHECK_EVERY}`,
    'def _pyodide_guard(frame, event, arg):',
    '    _pyodide_step_count[0] += 1',
    '    if _pyodide_step_count[0] % _pyodide_check_every == 0:',
    '        if _pyodide_time.time() - _pyodide_start_time > _pyodide_max_seconds:',
    '            raise RuntimeError("El programa parece tener un bucle infinito: paso demasiado tiempo sin terminar.")',
    '    return _pyodide_guard',
    '_pyodide_sys.settrace(_pyodide_guard)',
    '',
  ].join('\n');
}

// sys.settrace es una configuración global del intérprete, no algo scopeado
// al namespace de esta ejecución: hay que apagarlo después de cada corrida
// para no dejarlo activo (con más overhead del necesario) en la siguiente.
async function clearGuard(pyodide: PyodideInterface): Promise<void> {
  try {
    await pyodide.runPythonAsync('import sys as _s; _s.settrace(None)');
  } catch {
    // No hay mucho que hacer si esto falla; no debería pasar nunca.
  }
}

// input() no tiene con qué leer en un navegador: antes de correr el código
// del alumno, reemplazamos el builtin input por una versión que devuelve,
// en orden, los valores simulados que se le hayan pasado a runCode.
function buildInputSetup(inputs: string[]): string {
  const literal = JSON.stringify(inputs);
  return [
    'import builtins as _b',
    `_pyodide_inputs = iter(${literal})`,
    'def _pyodide_fake_input(prompt=""):',
    '    try:',
    '        return next(_pyodide_inputs)',
    '    except StopIteration:',
    '        raise EOFError("El programa pidio mas input() del que se le dio")',
    '_b.input = _pyodide_fake_input',
    '',
  ].join('\n');
}

function makeNamespace(pyodide: PyodideInterface): PyProxy {
  const dictType = pyodide.globals.get('dict') as unknown as () => PyProxy;
  return dictType();
}

function toPyArg(pyodide: PyodideInterface, value: unknown): unknown {
  if (value !== null && typeof value === 'object') return pyodide.toPy(value);
  return value;
}

function fromPyResult(value: unknown): unknown {
  if (value && typeof (value as PyProxy).toJs === 'function') {
    return (value as PyProxy).toJs();
  }
  return value;
}

// sys.settrace solo empieza a rastrear frames NUEVOS creados después de
// activarlo — el código que corre en el mismo frame donde se llamó a
// settrace nunca se traza. Un script del alumno ejecutado tal cual, al
// mismo nivel que el setup del guard, quedaría sin protección. Por eso acá
// se envuelve el código del alumno en una función y se la llama: la llamada
// sí abre un frame nuevo, y ahí el guard funciona de verdad.
function wrapAsCalledFunction(code: string): string {
  const indented = code
    .split('\n')
    .map((line) => (line.length ? '    ' + line : line))
    .join('\n');
  return `def _pyodide_main():\n${indented}\n    pass\n_pyodide_main()\n`;
}

// Recorre las figuras de matplotlib que haya dejado abiertas el código del
// alumno y las guarda como PNG en base64. Corre en el mismo namespace que el
// código ya ejecutado (así ve las figuras que se crearon ahí), pero importa
// pyplot con su propio alias para no depender de cómo lo haya importado el
// alumno. Si algo falla acá, no se pierde el resultado ya obtenido: se
// devuelve sin imágenes en vez de propagar el error.
async function captureImages(pyodide: PyodideInterface, namespace: PyProxy): Promise<string[]> {
  const captureCode = [
    'import matplotlib.pyplot as _pyodide_plt',
    'import io as _pyodide_io, base64 as _pyodide_base64',
    '_pyodide_images = []',
    'for _pyodide_fignum in _pyodide_plt.get_fignums():',
    '    _pyodide_fig = _pyodide_plt.figure(_pyodide_fignum)',
    '    _pyodide_buf = _pyodide_io.BytesIO()',
    '    _pyodide_fig.savefig(_pyodide_buf, format="png", bbox_inches="tight")',
    '    _pyodide_buf.seek(0)',
    '    _pyodide_images.append(_pyodide_base64.b64encode(_pyodide_buf.read()).decode("ascii"))',
    '_pyodide_plt.close("all")',
    '',
  ].join('\n');

  try {
    await pyodide.runPythonAsync(captureCode, { globals: namespace });
    const raw = namespace.get('_pyodide_images');
    if (raw && typeof (raw as PyProxy).toJs === 'function') {
      return ((raw as PyProxy).toJs() as unknown[]).map((v) => String(v));
    }
    return [];
  } catch {
    return [];
  }
}

// Corre un script completo (con print/input) y devuelve lo que imprimió.
// dataScience: true carga pandas/NumPy/matplotlib y captura los gráficos que
// haya dejado abiertos el código del alumno.
export async function runCode(
  code: string,
  options: { inputs?: string[]; dataScience?: boolean } = {}
): Promise<RunResult> {
  if (options.dataScience) await ensureDataSciencePackages();
  const pyodide = await getPyodide();

  let stdout = '';
  let stderr = '';
  pyodide.setStdout({ batched: (msg) => { stdout += stdout ? '\n' + msg : msg; } });
  pyodide.setStderr({ batched: (msg) => { stderr += stderr ? '\n' + msg : msg; } });

  const namespace = makeNamespace(pyodide);
  const preamble = buildGuardSetup() + buildInputSetup(options.inputs ?? []);
  const fullCode = preamble + '\n' + wrapAsCalledFunction(code);

  try {
    await pyodide.runPythonAsync(fullCode, { globals: namespace });
    const images = options.dataScience ? await captureImages(pyodide, namespace) : undefined;
    return { stdout, stderr, error: null, images };
  } catch (err) {
    return { stdout, stderr, error: describeError(err) };
  } finally {
    namespace.destroy();
    await clearGuard(pyodide);
  }
}

// Corre el código del alumno (que debe definir functionName) en un namespace
// limpio y llama a la función con cada caso de prueba, comparando el
// resultado. Se usa para ejercicios de funciones/clases (unidades 8 y 12 del
// taller de Python) y para ejercicios de DataFrames (dataScience: true) que
// devuelven un valor serializable en vez de imprimir texto.
export async function runFunctionTest(
  code: string,
  functionName: string,
  cases: FunctionTestCase[],
  options: { dataScience?: boolean } = {}
): Promise<FunctionTestResult> {
  if (options.dataScience) await ensureDataSciencePackages();
  const pyodide = await getPyodide();

  pyodide.setStdout({ batched: () => {} });
  pyodide.setStderr({ batched: () => {} });

  const namespace = makeNamespace(pyodide);

  try {
    await pyodide.runPythonAsync(buildGuardSetup(), { globals: namespace });
    await pyodide.runPythonAsync(code, { globals: namespace });
  } catch (err) {
    namespace.destroy();
    await clearGuard(pyodide);
    return { passed: false, error: describeError(err), cases: [] };
  }

  const fn = namespace.get(functionName);
  if (typeof fn !== 'function') {
    namespace.destroy();
    await clearGuard(pyodide);
    return { passed: false, error: `No se encontro una funcion llamada ${functionName}.`, cases: [] };
  }

  const results: FunctionTestResult['cases'] = [];
  let allPassed = true;

  for (const testCase of cases) {
    try {
      const args = testCase.args.map((a) => toPyArg(pyodide, a));
      const rawResult = (fn as (...a: unknown[]) => unknown)(...args);
      const actual = fromPyResult(rawResult);
      const passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);
      if (!passed) allPassed = false;
      results.push({ args: testCase.args, expected: testCase.expected, actual, passed });
    } catch (err) {
      allPassed = false;
      results.push({ args: testCase.args, expected: testCase.expected, actual: describeError(err), passed: false });
    }
  }

  namespace.destroy();
  await clearGuard(pyodide);
  return { passed: allPassed, error: null, cases: results };
}
