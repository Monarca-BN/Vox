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

async function getComentariosDesdeA() {
  const res = await fetch("/api/comentarios");
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

function renderCard(c) {
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
  if (!items.length) {
    feed.innerHTML = `<div class="empty">No hay comentarios relevantes todavía.</div>`;
  } else {
    feed.innerHTML = items.map(renderCard).join("");
  }
  setBanner(opts.error || "", Boolean(opts.error));
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
  load(true);
  setInterval(() => load(false), POLL_MS);
});
