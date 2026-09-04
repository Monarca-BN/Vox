import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getComentarios } from "./provider.js";
import { applyComentarioFilters } from "./filters.js";
import { createTicket, listTickets, cerrarTicket } from "./tickets.js";
import { isComentarioAnalizado } from "../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 1024 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  const data = Buffer.isBuffer(body)
    ? body
    : typeof body === "string"
      ? Buffer.from(body)
      : Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    "Content-Type": type,
    ...CORS,
    "Cache-Control": "no-store",
  });
  res.end(data);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        reject(new Error("empty body"));
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });
}

function comentarioFromBody(body) {
  if (isComentarioAnalizado(body)) return body;
  if (body && typeof body === "object" && isComentarioAnalizado(body.comentario)) {
    return body.comentario;
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/comentarios") {
    try {
      const envelope = await getComentarios();
      const comentarios = applyComentarioFilters(
        envelope.comentarios,
        url.searchParams,
      );
      send(res, 200, { ...envelope, comentarios });
    } catch (err) {
      send(res, 200, {
        comentarios: [],
        updatedAt: new Date().toISOString(),
        error: String(err.message || err),
      });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/tickets") {
    send(res, 200, listTickets());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/tickets") {
    try {
      const body = await readJsonBody(req);
      const comentario = comentarioFromBody(body);
      if (!comentario) {
        send(res, 400, { error: "body must be ComentarioAnalizado or { comentario }" });
        return;
      }
      send(res, 201, createTicket(comentario));
    } catch (err) {
      send(res, 400, { error: String(err.message || err) });
    }
    return;
  }

  const closeMatch = url.pathname.match(/^\/api\/tickets\/([^/]+)\/cerrar$/);
  if (req.method === "POST" && closeMatch) {
    const ticket = cerrarTicket(decodeURIComponent(closeMatch[1]));
    if (!ticket) {
      send(res, 404, { error: "ticket not found" });
      return;
    }
    send(res, 200, ticket);
    return;
  }

  if (url.pathname === "/api/comentarios") {
    send(res, 405, { error: "method not allowed" });
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    send(res, req.method === "GET" || req.method === "POST" ? 404 : 405, {
      error: req.method === "GET" || req.method === "POST" ? "not found" : "method not allowed",
    });
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
