import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getComentarios } from "./provider.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  const data = Buffer.isBuffer(body)
    ? body
    : typeof body === "string"
      ? Buffer.from(body)
      : Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/comentarios") {
    try {
      send(res, 200, await getComentarios());
    } catch (err) {
      send(res, 200, {
        comentarios: [],
        updatedAt: new Date().toISOString(),
        error: String(err.message || err),
      });
    }
    return;
  }

  if (req.method !== "GET") {
    send(res, 405, { error: "method not allowed" });
    return;
  }

  const rel = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = path.normalize(path.join(publicDir, rel));
  if (!file.startsWith(publicDir)) {
    send(res, 403, { error: "forbidden" });
    return;
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      send(res, 404, { error: "not found" });
      return;
    }
    send(res, 200, buf, MIME[path.extname(file)] || "application/octet-stream");
  });
});

server.listen(PORT, () => {
  console.log("Vox on http://localhost:" + PORT);
});
