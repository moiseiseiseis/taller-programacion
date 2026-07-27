'use client';

// Tipado mínimo de la parte de la API de Pyodide que usamos. La librería
// completa no tiene tipos oficiales livianos, así que declaramos solo lo
// necesario en vez de instalar @types/pyodide (pensado para Node, no CDN).
export type PyProxy = {
  toJs: (options?: { dict_converter?: (entries: Iterable<[unknown, unknown]>) => unknown }) => unknown;
  destroy: () => void;
  get: (key: string) => unknown;
  [key: string]: unknown;
};

export type PyodideInterface = {
  runPythonAsync: (code: string, options?: { globals?: PyProxy }) => Promise<unknown>;
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  globals: PyProxy;
  toPy: (value: unknown) => unknown;
  // Descarga e instala paquetes precompilados (numpy, pandas, matplotlib, etc.)
  // desde el repositorio de paquetes de Pyodide. No los importa todavía.
  loadPackage: (names: string | string[]) => Promise<void>;
};

declare global {
  interface Window {
    loadPyodide?: (options?: { indexURL?: string }) => Promise<PyodideInterface>;
  }
}

// Se ejecuta código de alumnos que puede tener errores de sintaxis o
// lanzar excepciones cualquiera; Pyodide envuelve todo en PythonError.
export class PythonError extends Error {}

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise: Promise<PyodideInterface> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Pyodide desde el CDN.'));
    document.head.appendChild(script);
  });
}

// Singleton: la primera vez que se llama dispara la carga (script + wasm);
// las siguientes llamadas reciben la misma instancia ya lista.
export function getPyodide(): Promise<PyodideInterface> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Pyodide solo puede cargarse en el navegador.'));
  }
  if (!pyodidePromise) {
    pyodidePromise = loadScript(`${PYODIDE_CDN_BASE}pyodide.js`).then(() => {
      if (!window.loadPyodide) throw new Error('Pyodide no se inicializó correctamente.');
      return window.loadPyodide({ indexURL: PYODIDE_CDN_BASE });
    });
  }
  return pyodidePromise;
}
