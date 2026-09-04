/**
 * Server-side AND filters for GET /api/comentarios (spec 002).
 * Unknown query keys are ignored. Invalid severity / es_bug → no match.
 */

const SEVERITIES = new Set(["low", "medium", "high"]);

function readPresent(searchParams, key) {
  if (!searchParams || typeof searchParams.get !== "function") return null;
  if (!searchParams.has(key)) return null;
  return searchParams.get(key);
}

/**
 * @param {unknown[]} comentarios
 * @param {URLSearchParams | { get?: Function, has?: Function }} searchParams
 * @returns {unknown[]}
 */
export function applyComentarioFilters(comentarios, searchParams) {
  const list = Array.isArray(comentarios) ? comentarios : [];

  const severityRaw = readPresent(searchParams, "severity");
  const esBugRaw = readPresent(searchParams, "es_bug");
  const featureRaw = readPresent(searchParams, "feature");

  let result = list;

  if (severityRaw !== null) {
    const sev = String(severityRaw).trim().toLowerCase();
    if (!SEVERITIES.has(sev)) return [];
    result = result.filter((c) => c && c.severity === sev);
  }

  if (esBugRaw !== null) {
    const token = String(esBugRaw).trim().toLowerCase();
    if (token !== "true" && token !== "false") return [];
    const wanted = token === "true";
    result = result.filter((c) => c && c.es_bug === wanted);
  }

  if (featureRaw !== null) {
    const feat = String(featureRaw).trim().toLowerCase();
    if (feat !== "") {
      result = result.filter(
        (c) => c && String(c.feature).trim().toLowerCase() === feat,
      );
    }
  }

  return result;
}
