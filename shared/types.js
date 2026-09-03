/**
 * Contrato A ↔ B. No lo cambien a mitad del hackathon.
 *
 * @typedef {Object} ComentarioAnalizado
 * @property {string} texto
 * @property {boolean} es_bug
 * @property {'low' | 'medium' | 'high'} severity
 * @property {string} feature
 * @property {string} resumen
 */

export const SEVERITIES = ["low", "medium", "high"];

/** @param {unknown} x @returns {x is ComentarioAnalizado} */
export function isComentarioAnalizado(x) {
  if (!x || typeof x !== "object") return false;
  const c = /** @type {Record<string, unknown>} */ (x);
  return (
    typeof c.texto === "string" &&
    c.texto.trim().length > 0 &&
    typeof c.es_bug === "boolean" &&
    SEVERITIES.includes(/** @type {string} */ (c.severity)) &&
    typeof c.feature === "string" &&
    c.feature.trim().length > 0 &&
    typeof c.resumen === "string" &&
    c.resumen.trim().length > 0
  );
}
