// Parsea un campo JSON opcional que viene de un textarea de formulario.
// Vacío -> null (sin dato). Inválido -> lanza con un mensaje claro.
export function parseOptionalJson(raw: string | null, errorMessage = 'El JSON no es válido.') {
  if (!raw || !raw.trim()) return null;

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(errorMessage);
  }
}
