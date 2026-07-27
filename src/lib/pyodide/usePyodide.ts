'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getPyodide } from './pyodideClient';
import { ensureDataSciencePackages } from './dataScience';
import { runCode, runFunctionTest, type FunctionTestCase, type FunctionTestResult, type RunResult } from './runPython';

export type PyodideStatus = 'loading' | 'loading-packages' | 'ready' | 'error';

// Carga Pyodide la primera vez que se monta un componente que lo necesita
// (nunca en el layout global) y expone las dos formas de correr código del
// alumno: como script (runCode) o probando una función (runTest). La carga
// arranca sola al montar, por eso el estado inicial ya es 'loading'.
//
// dataScience: true además carga pandas/NumPy/matplotlib (pesado, solo lo
// piden las lecciones del taller de Análisis de Datos) antes de pasar a
// 'ready', pasando por un estado intermedio 'loading-packages'.
export function usePyodide(options: { dataScience?: boolean } = {}) {
  const { dataScience = false } = options;
  const [status, setStatus] = useState<PyodideStatus>('loading');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    getPyodide()
      .then(async () => {
        if (!dataScience) {
          if (mountedRef.current) setStatus('ready');
          return;
        }
        if (mountedRef.current) setStatus('loading-packages');
        await ensureDataSciencePackages();
        if (mountedRef.current) setStatus('ready');
      })
      .catch(() => {
        if (mountedRef.current) setStatus('error');
      });
    return () => {
      mountedRef.current = false;
    };
  }, [dataScience]);

  const run = useCallback(
    async (code: string, runOptions?: { inputs?: string[] }): Promise<RunResult> => {
      return runCode(code, { ...runOptions, dataScience });
    },
    [dataScience]
  );

  const runTest = useCallback(
    async (code: string, functionName: string, cases: FunctionTestCase[]): Promise<FunctionTestResult> => {
      return runFunctionTest(code, functionName, cases, { dataScience });
    },
    [dataScience]
  );

  return { status, run, runTest };
}
