'use client';

import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Play, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { usePyodide } from '@/lib/pyodide/usePyodide';
import { checkTestSpec, type PythonTestSpec, type TestSpecResult } from '@/lib/pythonTestSpec';
import type { RunResult } from '@/lib/pyodide/runPython';

// Si el programa entró en un bucle que el guard corta tarde (o simplemente
// imprime mucho), evita volcar miles de líneas al DOM: se corta la vista,
// no el dato real (el guard del motor ya limita cuánto se ejecuta).
const MAX_DISPLAY_CHARS = 4000;

function truncateForDisplay(text: string): string {
  if (text.length <= MAX_DISPLAY_CHARS) return text;
  return text.slice(0, MAX_DISPLAY_CHARS) + '\n… (salida recortada)';
}

function needsDataScience(testSpec: PythonTestSpec | undefined): boolean {
  if (!testSpec) return false;
  if (testSpec.type === 'has_image') return true;
  return 'dataScience' in testSpec && testSpec.dataScience === true;
}

function ImageResults({ images }: { images: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- imagen generada en el navegador (base64), no un asset que Next pueda optimizar
        <img
          key={i}
          src={`data:image/png;base64,${img}`}
          alt={`Gráfico ${i + 1}`}
          className="max-w-full rounded-lg border border-brand-terminal-border bg-white"
        />
      ))}
    </div>
  );
}

export default function PyodideCodeRunner({
  starterCode,
  testSpec,
  onResult,
  disabled,
}: {
  starterCode: string;
  testSpec?: PythonTestSpec;
  onResult?: (passed: boolean) => void;
  disabled?: boolean;
}) {
  const dataScience = needsDataScience(testSpec);
  const { status, run } = usePyodide({ dataScience });
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState<RunResult | null>(null);
  const [checkResult, setCheckResult] = useState<TestSpecResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const loading = status === 'loading' || status === 'loading-packages';

  async function handleRun() {
    setIsRunning(true);
    setOutput(null);
    try {
      const inputs = testSpec && 'inputs' in testSpec ? testSpec.inputs : undefined;
      const result = await run(code, { inputs });
      setOutput(result);
    } finally {
      setIsRunning(false);
    }
  }

  async function handleCheck() {
    if (!testSpec) return;
    setIsChecking(true);
    setCheckResult(null);
    try {
      const result = await checkTestSpec(testSpec, code);
      setCheckResult(result);
      onResult?.(result.passed);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border border-brand-terminal-border">
        <CodeMirror
          value={code}
          height="220px"
          theme={vscodeDark}
          extensions={[python()]}
          onChange={(value) => setCode(value)}
          editable={!disabled}
          basicSetup={{ tabSize: 4 } as Record<string, unknown>}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={disabled || loading || isRunning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-black/30 border border-brand-terminal-border text-brand-beige hover:bg-black/40 disabled:opacity-50 transition-colors"
        >
          {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          Ejecutar
        </button>

        {testSpec && (
          <button
            type="button"
            onClick={handleCheck}
            disabled={disabled || loading || isChecking}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-brand-mint text-[#0f1a15] hover:brightness-110 disabled:opacity-50 transition-colors"
          >
            {isChecking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Comprobar
          </button>
        )}

        {status === 'loading' && <span className="text-xs text-[#9c9c94]">Cargando Python en el navegador...</span>}
        {status === 'loading-packages' && (
          <span className="text-xs text-[#9c9c94]">Cargando pandas y NumPy... la primera vez puede tardar un poco más.</span>
        )}
      </div>

      {output && (
        <div className="space-y-3">
          <div className="rounded-lg bg-black text-[#c8c8c0] text-sm font-mono p-4 whitespace-pre-wrap">
            {output.error ? (
              <span className="text-brand-salmon">{output.error}</span>
            ) : (
              <>
                {output.stdout && <div>{truncateForDisplay(output.stdout)}</div>}
                {output.stderr && <div className="text-amber-400">{truncateForDisplay(output.stderr)}</div>}
                {!output.stdout && !output.stderr && (!output.images || output.images.length === 0) && (
                  <span className="text-[#6f6f68]">(sin salida)</span>
                )}
              </>
            )}
          </div>
          {output.images && output.images.length > 0 && <ImageResults images={output.images} />}
        </div>
      )}

      {checkResult && (
        <div className="space-y-3">
          <div
            className={`rounded-lg p-4 text-sm font-mono whitespace-pre-wrap flex items-start gap-2 ${
              checkResult.passed ? 'bg-brand-mint/10 text-brand-mint' : 'bg-brand-salmon/10 text-brand-salmon'
            }`}
          >
            {checkResult.passed ? (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            ) : (
              <XCircle size={18} className="shrink-0 mt-0.5" />
            )}
            <span>{checkResult.detail}</span>
          </div>
          {checkResult.images && checkResult.images.length > 0 && <ImageResults images={checkResult.images} />}
        </div>
      )}
    </div>
  );
}
