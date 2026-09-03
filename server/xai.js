/**
 * Stub. No está cableado.
 * Si más adelante hay XAI_API_KEY, aquí iría POST https://api.x.ai/v1/responses
 * con tools: [{ type: "x_search" }] y el parseo al tipo ComentarioAnalizado.
 */
export async function fetchXai() {
  return {
    comentarios: [],
    updatedAt: new Date().toISOString(),
    error: "x_search no está activo (USE_MOCK=1). No hay llamadas a xAI.",
  };
}
