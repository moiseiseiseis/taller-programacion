import { runCode, runFunctionTest, type FunctionTestResult } from './pyodide/runPython';

export type PythonTestSpec =
  | { type: 'stdout_equals'; inputs?: string[]; value: string; dataScience?: boolean }
  | { type: 'stdout_contains'; inputs?: string[]; value: string; dataScience?: boolean }
  | { type: 'no_error'; inputs?: string[]; dataScience?: boolean }
  | { type: 'function_returns'; function: string; cases: { args: unknown[]; expected: unknown }[]; dataScience?: boolean }
  | {
      type: 'multi_function_returns';
      functions: { function: string; cases: { args: unknown[]; expected: unknown }[] }[];
      dataScience?: boolean;
    }
  // Para ejercicios de gráficos: corre el código y aprueba si generó al
  // menos una figura de matplotlib. No juzga si el gráfico "se ve bien" —
  // eso lo confirma el alumno mismo viendo la imagen renderizada.
  | { type: 'has_image'; inputs?: string[] };

export type TestSpecResult = {
  passed: boolean;
  detail: string;
  functionResult?: FunctionTestResult;
  images?: string[];
};

// Corre el código del alumno contra un test_spec y decide si aprueba. Se usa
// tanto para los ejercicios guiados/libres (python_exercises) como para las
// preguntas de completar/depurar del quiz mixto (misma forma de validar).
export async function checkTestSpec(spec: PythonTestSpec, code: string): Promise<TestSpecResult> {
  switch (spec.type) {
    case 'stdout_equals': {
      const result = await runCode(code, { inputs: spec.inputs, dataScience: spec.dataScience });
      if (result.error) return { passed: false, detail: result.error, images: result.images };
      const passed = result.stdout.trim() === spec.value.trim();
      return {
        passed,
        detail: passed ? 'La salida coincide.' : `Se esperaba:\n${spec.value}\n\nSe obtuvo:\n${result.stdout}`,
        images: result.images,
      };
    }

    case 'stdout_contains': {
      const result = await runCode(code, { inputs: spec.inputs, dataScience: spec.dataScience });
      if (result.error) return { passed: false, detail: result.error, images: result.images };
      const passed = result.stdout.includes(spec.value);
      return {
        passed,
        detail: passed ? 'La salida contiene lo esperado.' : `La salida no contiene "${spec.value}".\n\nSe obtuvo:\n${result.stdout}`,
        images: result.images,
      };
    }

    case 'no_error': {
      const result = await runCode(code, { inputs: spec.inputs, dataScience: spec.dataScience });
      return {
        passed: !result.error,
        detail: result.error ? result.error : 'El programa corrio sin errores.',
        images: result.images,
      };
    }

    case 'has_image': {
      const result = await runCode(code, { inputs: spec.inputs, dataScience: true });
      if (result.error) return { passed: false, detail: result.error };
      const passed = !!result.images && result.images.length > 0;
      return {
        passed,
        detail: passed ? 'Se generó al menos un gráfico.' : 'El código corrió, pero no se generó ningún gráfico.',
        images: result.images,
      };
    }

    case 'function_returns': {
      const result = await runFunctionTest(code, spec.function, spec.cases, { dataScience: spec.dataScience });
      if (result.error) return { passed: false, detail: result.error, functionResult: result };
      const failedCases = result.cases.filter((c) => !c.passed);
      const detail = result.passed
        ? 'Todos los casos de prueba pasaron.'
        : failedCases
            .map((c) => `${spec.function}(${c.args.map((a) => JSON.stringify(a)).join(', ')}) dio ${JSON.stringify(c.actual)}, se esperaba ${JSON.stringify(c.expected)}`)
            .join('\n');
      return { passed: result.passed, detail, functionResult: result };
    }

    case 'multi_function_returns': {
      // Se corren una por una, nunca en paralelo: todas comparten la misma
      // instancia de Pyodide (stdout redirigido, sys.settrace) y correrlas
      // a la vez corrompería ese estado compartido entre sí.
      const perFunction: { function: string; result: FunctionTestResult }[] = [];
      let passed = true;
      for (const f of spec.functions) {
        const result = await runFunctionTest(code, f.function, f.cases, { dataScience: spec.dataScience });
        if (!result.passed) passed = false;
        perFunction.push({ function: f.function, result });
      }
      const detail = passed
        ? 'Todas las funciones pasaron sus casos de prueba.'
        : perFunction
            .filter((f) => !f.result.passed)
            .map((f) => `${f.function}: ${f.result.error ?? 'algún caso no coincidió con lo esperado'}`)
            .join('\n');
      return { passed, detail };
    }

    default:
      return { passed: false, detail: 'Tipo de validador desconocido.' };
  }
}
