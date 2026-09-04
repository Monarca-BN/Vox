const TEMA = "Grok";
const POLL_MS = 60000;

const SEVERIDAD = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const SEV_ORDER = { high: 0, medium: 1, low: 2 };

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

const state = {
  items: [],
  visible: [],
  updatedAt: null,
  fuente: "live",
  error: "",
  query: "",
  severity: "all",
  soloBugs: false,
  feature: "",
  sort: "severity",
};

let loadGen = 0;

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

function normalizeSev(sev) {
  return ["high", "medium", "low"].includes(sev) ? sev : "low";
}

function toComentario(c) {
  return {
    texto: String(c.texto || ""),
    es_bug: Boolean(c.es_bug),
    severity: normalizeSev(c.severity),
    feature: String(c.feature || ""),
    resumen: String(c.resumen || ""),
  };
}

function queryComentarios() {
  const params = new URLSearchParams();
  if (state.severity !== "all") params.set("severity", state.severity);
  if (state.soloBugs) params.set("es_bug", "true");
  const feat = state.feature.trim();
  if (feat) params.set("feature", feat);
  const q = params.toString();
  return q ? "/api/comentarios?" + q : "/api/comentarios";
}

async function getComentariosDesdeA() {
  const res = await fetch(queryComentarios(), { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

function getFilteredSorted() {
  const q = state.query.trim().toLowerCase();
  let list = state.items.slice();

  if (q) {
    list = list.filter((c) => {
      const blob = [c.resumen, c.texto, c.feature]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");
      return blob.includes(q);
    });
  }

  if (state.sort === "severity") {
    list.sort((a, b) => {
      const da = SEV_ORDER[normalizeSev(a.severity)] ?? 9;
      const db = SEV_ORDER[normalizeSev(b.severity)] ?? 9;
      if (da !== db) return da - db;
      return (a.__i ?? 0) - (b.__i ?? 0);
    });
  } else {
    list.sort((a, b) => (a.__i ?? 0) - (b.__i ?? 0));
  }

  return list;
}

function renderCard(c) {
  const sev = normalizeSev(c.severity);
  const feature = escapeHtml(c.feature || "General");
  const resumen = escapeHtml(c.resumen || "");
  const texto = escapeHtml(c.texto || "");
  const bug = c.es_bug ? `<span class="chip bug">Bug</span>` : "";
  const label = `${SEVERIDAD[sev]}${c.es_bug ? ", bug" : ""}: ${c.resumen || c.texto || "incidencia"}`;

  return `
    <article class="card ${sev}" aria-label="${escapeHtml(label)}">
      <div class="card-head">
        <span class="badge ${sev}">${SEVERIDAD[sev]}</span>
        <span class="chip">${feature}</span>
        ${bug}
      </div>
      <h2 class="resumen">${resumen}</h2>
      <blockquote class="texto">${texto}</blockquote>
    </article>
  `;
}

function updateStats(visible) {
  $("stat-total").textContent = String(visible.length);
  $("stat-bugs").textContent = String(visible.filter((c) => c.es_bug).length);
  $("stat-high").textContent = String(visible.filter((c) => normalizeSev(c.severity) === "high").length);
  $("stat-medium").textContent = String(visible.filter((c) => normalizeSev(c.severity) === "medium").length);
  $("stat-low").textContent = String(visible.filter((c) => normalizeSev(c.severity) === "low").length);
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

function pintar() {
  const feed = $("feed");
  const items = getFilteredSorted();
  state.visible = items;

  setFuente(state.fuente);
  $("meta").textContent = state.items.length
    ? state.items.length + " en el feed · actualizado " + hora(state.updatedAt)
    : "Nada en el feed · " + hora(state.updatedAt);

  updateStats(items);

  const hasFilter =
    state.severity !== "all" ||
    state.soloBugs ||
    Boolean(state.feature.trim()) ||
    Boolean(state.query.trim());

  if (!state.items.length && !hasFilter) {
    feed.innerHTML = `
      <div class="empty" role="status">
        <span class="empty-title">No hay incidencias todavía</span>
        <span class="empty-hint">Lo que llega filtrado es el trabajo: cada tarjeta es un ticket sobre ${escapeHtml(TEMA)}.</span>
      </div>`;
  } else if (!items.length) {
    feed.innerHTML = `
      <div class="empty" role="status">
        <span class="empty-title">Nada coincide en el feed</span>
        <span class="empty-hint">Prueba otra búsqueda, severidad, feature o desactiva «Solo bugs».</span>
      </div>`;
  } else {
    feed.innerHTML = items.map(renderCard).join("");
  }

  setBanner(state.error || "", Boolean(state.error));
}

function applyItems(raw, opts) {
  const arr = Array.isArray(raw) ? raw : [];
  state.items = arr.map((c, i) => ({ ...toComentario(c), __i: i }));
  state.updatedAt = opts.updatedAt;
  state.fuente = opts.fuente;
  state.error = opts.error || "";
  pintar();
}

async function load(primera) {
  const gen = ++loadGen;
  const btn = $("btn-refresh");
  if (btn) btn.classList.add("is-spinning");

  if (primera) {
    $("feed").innerHTML = `
      <div class="loading" role="status">
        <span class="loading-title">Cargando el feed<span class="loading-dot" aria-hidden="true"></span></span>
        <span class="loading-hint">Consultando /api/comentarios…</span>
      </div>`;
  }

  try {
    const data = await getComentariosDesdeA();
    if (gen !== loadGen) return;
    applyItems(data.comentarios, {
      fuente: "live",
      updatedAt: data.updatedAt,
      error: data.error || "",
    });
  } catch (err) {
    if (gen !== loadGen) return;
    applyItems(FALLBACK, {
      fuente: "fallback",
      updatedAt: new Date().toISOString(),
      error: "A no responde en /api/comentarios. Fallback local. " + err.message,
    });
  } finally {
    if (gen === loadGen && btn) btn.classList.remove("is-spinning");
  }
}

function setSeverity(sev) {
  state.severity = sev;
  document.querySelectorAll("#sev-chips .filter-chip").forEach((btn) => {
    const active = btn.dataset.sev === sev;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
  load(false);
}

function bindControls() {
  const search = $("search");
  let searchTimer = null;
  search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = search.value;
      pintar();
    }, 120);
  });

  document.querySelectorAll("#sev-chips .filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => setSeverity(btn.dataset.sev));
  });

  $("solo-bugs").addEventListener("change", (e) => {
    state.soloBugs = e.target.checked;
    load(false);
  });

  const feature = $("filtro-feature");
  let featureTimer = null;
  feature.addEventListener("input", () => {
    clearTimeout(featureTimer);
    featureTimer = setTimeout(() => {
      state.feature = feature.value;
      load(false);
    }, 180);
  });
  feature.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    clearTimeout(featureTimer);
    state.feature = feature.value;
    load(false);
  });

  $("sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    pintar();
  });

  $("btn-refresh").addEventListener("click", () => load(false));
}

function registrarSW() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

document.addEventListener("DOMContentLoaded", () => {
  $("tema").textContent = TEMA;
  bindControls();
  registrarSW();
  load(true);
  setInterval(() => {
    load(false);
  }, POLL_MS);
});
