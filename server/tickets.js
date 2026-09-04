/**
 * In-memory fake tickets. Lost when the process exits.
 * Not Linear. Not Supabase. (spec 003)
 */

let seq = 1;
/** @type {object[]} */
let tickets = [];
let updatedAt = new Date().toISOString();

function deriveTitulo(comentario) {
  const resumen = String(comentario.resumen || "").trim();
  if (resumen) return resumen.length > 80 ? resumen.slice(0, 80) : resumen;
  return String(comentario.texto || "").trim().slice(0, 80);
}

/**
 * @param {{ texto: string, es_bug: boolean, severity: string, feature: string, resumen: string }} comentario
 */
export function createTicket(comentario) {
  const createdAt = new Date().toISOString();
  const ticket = {
    id: "T-" + seq++,
    titulo: deriveTitulo(comentario),
    estado: "abierto",
    severity: comentario.severity,
    feature: comentario.feature,
    es_bug: comentario.es_bug,
    resumen: comentario.resumen,
    textoOrigen: comentario.texto,
    createdAt,
  };
  tickets = [...tickets, ticket];
  updatedAt = createdAt;
  return ticket;
}

export function listTickets() {
  return { tickets: tickets.slice(), updatedAt };
}

/**
 * @param {string} id
 * @returns {object | null}
 */
export function cerrarTicket(id) {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return null;
  ticket.estado = "hecho";
  updatedAt = new Date().toISOString();
  return ticket;
}
