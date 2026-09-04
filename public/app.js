const TEMA = "Grok";
const POLL_MS = 60000;

const SEVERIDAD = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const FALLBACK = [
  {
    texto: "Grok se queda pensando 40 segundos y nunca termina la respuesta en el celular.",
    es_bug: true,
    severity: "high",
    feature: "latencia",
    resumen: "Timeout o hang en respuestas largas en mobile.",
  },
  {
    texto: "Quiero un filtro para ocultar respuestas sarcásticas cuando pido datos serios.",
    es_bug: false,
    severity: "medium",
    feature: "tono",
    resumen: "Piden un modo formal sin sarcasmo.",
  },
  {
    texto: "El dark mode parpadea blanco al recargar. Me duele la vista a las 2am.",
    es_bug: true,
    severity: "low",
    feature: "tema",
    resumen: "Flash blanco al cargar con tema oscuro.",
  },
];

const $ = (id) => document.getElementById(id);

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hora(iso) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

let comentariosActuales = [];

function queryComentarios() {
  const params = new URLSearchParams();
  const sev = $("filtro-severity")?.value || "";
  const bug = $("filtro-es_bug")?.value || "";
  const feat = ($("filtro-feature")?.value || "").trim();
  if (sev) params.set("severity", sev);
  if (bug) params.set("es_bug", bug);
  if (feat) params.set("feature", feat);
  const q = params.toString();
  return q ? "/api/comentarios?" + q : "/api/comentarios";
}

async function getComentariosDesdeA() {
  const res = await fetch(queryComentarios());
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

function renderCard(c, i) {
  const sev = ["high", "medium", "low"].includes(c.severity) ? c.severity : "low";
  const bug = c.es_bug ? `<span class="chip bug">Bug</span>` : "";
  return `
    <article class="card ${sev}">
      <div class="card-head">
        <span class="badge ${sev}">${SEVERIDAD[sev]}</span>
        <span class="chip">${escapeHtml(c.feature || "General")}</span>
        ${bug}
      </div>
      <p class="resumen">${escapeHtml(c.resumen || "")}</p>
      <p class="texto">${escapeHtml(c.texto || "")}</p>
      <button type="button" class="btn-ticket" data-idx="${i}">Crear ticket</button>
    </article>
  `;
}

function setFuente(fuente) {
  const el = $("fuente");
  el.textContent = fuente;
  el.className = "pill " + fuente;
}

function setBanner(msg, isError) {
  const el = $("banner");
  if (!msg) {
    el.className = "banner hidden";
    el.textContent = "";
    return;
  }
  el.className = "banner" + (isError ? " error" : "");
  el.textContent = msg;
}

function pintar(items, opts) {
  const feed = $("feed");
  setFuente(opts.fuente);
  $("meta").textContent = items.length
    ? items.length + " comentarios · " + hora(opts.updatedAt)
    : "Sin comentarios · " + hora(opts.updatedAt);
  comentariosActuales = items;
  if (!items.length) {
    feed.innerHTML = `<div class="empty">No hay comentarios relevantes todavía.</div>`;
  } else {
    feed.innerHTML = items.map(renderCard).join("");
  }
  setBanner(opts.error || "", Boolean(opts.error));
}

function renderTicket(t) {
  const sev = ["high", "medium", "low"].includes(t.severity) ? t.severity : "low";
  const cerrado = t.estado === "hecho";
  return `
    <article class="card ticket ${sev}">
      <div class="card-head">
        <span class="chip">${escapeHtml(t.id)}</span>
        <span class="badge ${sev}">${SEVERIDAD[sev]}</span>
        <span class="chip ${cerrado ? "hecho" : "abierto"}">${cerrado ? "Hecho" : "Abierto"}</span>
      </div>
      <p class="resumen">${escapeHtml(t.titulo || t.resumen || "")}</p>
      <p class="texto">${escapeHtml(t.textoOrigen || "")}</p>
      ${cerrado ? "" : `<button type="button" class="btn-cerrar" data-id="${escapeHtml(t.id)}">Cerrar</button>`}
    </article>
  `;
}

async function loadTickets() {
  const box = $("tickets");
  const meta = $("tickets-meta");
  if (!box || !meta) return;
  try {
    const res = await fetch("/api/tickets");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const list = Array.isArray(data.tickets) ? data.tickets : [];
    meta.textContent = list.length
      ? list.length + " tickets · " + hora(data.updatedAt)
      : "Ninguno todavía · " + hora(data.updatedAt);
    box.innerHTML = list.length
      ? list.map(renderTicket).join("")
      : `<div class="empty">Crea un ticket desde un comentario. Son fingidos: viven solo mientras corre el server.</div>`;
  } catch (err) {
    meta.textContent = String(err);
  }
}

async function crearTicket(idx) {
  const c = comentariosActuales[idx];
  if (!c) return;
  const res = await fetch("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(c),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    setBanner(data.error || "No se pudo crear el ticket", true);
    return;
  }
  setBanner("Ticket " + data.id + " creado (fingido, no Linear)", false);
  await loadTickets();
}

async function cerrarTicketUi(id) {
  const res = await fetch("/api/tickets/" + encodeURIComponent(id) + "/cerrar", {
    method: "POST",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    setBanner(data.error || "No se pudo cerrar el ticket", true);
    return;
  }
  setBanner("Ticket " + data.id + " marcado como hecho", false);
  await loadTickets();
}

async function load(primera) {
  if (primera) {
    $("feed").innerHTML = `<div class="loading">Buscando comentarios</div>`;
  }
  try {
    const data = await getComentariosDesdeA();
    pintar(Array.isArray(data.comentarios) ? data.comentarios : [], {
      fuente: "live",
      updatedAt: data.updatedAt,
      error: data.error || "",
    });
  } catch (err) {
    pintar(FALLBACK, {
      fuente: "fallback",
      updatedAt: new Date().toISOString(),
      error: "A no responde en /api/comentarios. Fallback local. " + err.message,
    });
  }
}

function registrarSW() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

document.addEventListener("DOMContentLoaded", () => {
  $("tema").textContent = TEMA;
  registrarSW();
  $("aplicar-filtros")?.addEventListener("click", () => load(false));
  $("filtro-feature")?.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") load(false);
  });
  $("feed")?.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".btn-ticket");
    if (!btn) return;
    crearTicket(Number(btn.dataset.idx));
  });
  $("tickets")?.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".btn-cerrar");
    if (!btn) return;
    cerrarTicketUi(btn.dataset.id);
  });
  load(true);
  loadTickets();
  setInterval(() => load(false), POLL_MS);
});
