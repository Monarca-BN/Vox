import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isComentarioAnalizado } from "../shared/types.js";

const poolPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "mock",
  "comentarios.json",
);

const pool = JSON.parse(fs.readFileSync(poolPath, "utf8")).filter(isComentarioAnalizado);

let cache = [];
let nextIndex = 0;
let inFlight = false;
let updatedAt = new Date().toISOString();

function seenKey(c) {
  return c.texto.trim().toLowerCase();
}

function drip() {
  const seen = new Set(cache.map(seenKey));
  const n = cache.length === 0 ? 3 : Math.floor(Math.random() * 3);
  let added = 0;
  while (added < n && nextIndex < pool.length) {
    const item = pool[nextIndex++];
    const key = seenKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    cache = [...cache, item];
    added++;
  }
  if (added > 0) updatedAt = new Date().toISOString();
}

export async function fetchMock() {
  if (inFlight) {
    return { comentarios: cache, updatedAt };
  }
  inFlight = true;
  try {
    drip();
    return { comentarios: cache, updatedAt };
  } catch (err) {
    return {
      comentarios: cache,
      updatedAt,
      error: String(err.message || err),
    };
  } finally {
    inFlight = false;
  }
}
