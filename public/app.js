const main = document.getElementById("feed");
const meta = document.getElementById("meta");

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function load() {
  try {
    const res = await fetch("/api/comentarios");
    const data = await res.json();
    meta.textContent = data.error
      ? "Error: " + data.error
      : data.comentarios.length + " comentarios · " + (data.updatedAt ?? "");
    main.innerHTML = data.comentarios
      .map(function (c) {
        return (
          "<article><span class=\"badge " +
          escapeHtml(c.severity) +
          "\">" +
          escapeHtml(c.severity) +
          "</span><span class=\"feature\">" +
          escapeHtml(c.feature) +
          (c.es_bug ? " · bug" : " · feature") +
          "</span><p>" +
          escapeHtml(c.texto) +
          "</p><p class=\"feature\">" +
          escapeHtml(c.resumen) +
          "</p></article>"
        );
      })
      .join("");
  } catch (err) {
    meta.textContent = String(err);
  }
}

load();
setInterval(load, 60000);
