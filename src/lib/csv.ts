// Conversión mínima de filas a CSV para las exportaciones de datos de
// investigación (encuestas). Sin dependencias: solo hay que escapar comas,
// comillas y saltos de línea siguiendo RFC 4180.
export function toCsv(rows: Record<string, string | number | null | undefined>[], columns: string[]): string {
  function escape(value: string | number | null | undefined): string {
    const str = value === null || value === undefined ? '' : String(value);
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  }

  const header = columns.map(escape).join(',');
  const lines = rows.map((row) => columns.map((col) => escape(row[col])).join(','));
  // BOM al inicio para que Excel detecte UTF-8 y no rompa tildes/ñ.
  return '﻿' + [header, ...lines].join('\r\n');
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
