/**
 * Normaliza texto para búsquedas: ignora mayúsculas/minúsculas, tildes,
 * diéresis y otros signos diacríticos, y colapsa espacios repetidos.
 *
 * Ejemplos:
 *   "Vértigo"  -> "vertigo"
 *   "CORAZÓN"  -> "corazon"
 *   "Niño  raro" -> "nino raro"
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Comprueba si `text` contiene `query`, ignorando mayúsculas y tildes. */
export function matchesSearch(text: string, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  return normalizeSearchText(text).includes(normalizedQuery);
}
