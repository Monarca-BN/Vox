# Quickstart — Persona A mock API

1. From repo root: `node server/index.js`
2. Open `http://localhost:3000/api/comentarios`
3. Expect HTTP 200 JSON with `comentarios` (each item passes ComentarioAnalizado) and `updatedAt`
4. Repeat the request: same contract, no xAI key required
5. Confirm no call to `api.x.ai`
