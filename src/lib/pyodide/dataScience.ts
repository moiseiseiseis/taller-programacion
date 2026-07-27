'use client';

import { getPyodide } from './pyodideClient';

// numpy/pandas/matplotlib son pesados (decenas de MB entre los tres) y no
// los necesita el taller de Python base — por eso viven en un singleton
// separado del runtime de Pyodide, que solo se dispara cuando una lección
// del taller de Análisis de Datos los pide.
let dataSciencePromise: Promise<void> | null = null;

export function ensureDataSciencePackages(): Promise<void> {
  if (!dataSciencePromise) {
    dataSciencePromise = getPyodide().then(async (pyodide) => {
      await pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);
      // Pre-importar sin rastrear es crítico: el primer "import pandas" de
      // un proceso carga y ejecuta toda la librería, lo que por sí solo
      // dispara el guard de bucle infinito si ocurre dentro del código
      // rastreado del alumno. Haciéndolo acá, una sola vez, ese costo queda
      // afuera de cualquier ejecución rastreada posterior.
      await pyodide.runPythonAsync(
        'import numpy, pandas, matplotlib\n' + 'matplotlib.use("Agg")\n' + 'import matplotlib.pyplot as plt\n'
      );
    });
  }
  return dataSciencePromise;
}
