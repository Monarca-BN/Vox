# Quickstart — tickets fingidos

1. From repo root: `node server/index.js`
2. `GET http://localhost:3000/api/tickets` → `{ "tickets": [], "updatedAt": "…" }`
3. `POST http://localhost:3000/api/tickets` with a valid `ComentarioAnalizado` JSON → HTTP 201 ticket `T-1`
4. Repeat GET → that ticket is in `tickets[]`
5. `POST http://localhost:3000/api/tickets` with `{}` → HTTP 400 `{ "error": "…" }`
6. `POST http://localhost:3000/api/tickets/T-1/cerrar` → `estado: "hecho"`
7. Restart the server; GET again → empty list
8. Open `http://localhost:3000`: filter the feed, **Crear ticket** on a card, see the tickets section
9. Confirm no Linear / xAI / Supabase calls

Example create:

```bash
curl -sS -D - -X POST http://localhost:3000/api/tickets \
  -H 'Content-Type: application/json' \
  -d '{"texto":"Grok se queda pensando 40 segundos y nunca termina la respuesta en el celular.","es_bug":true,"severity":"high","feature":"latencia","resumen":"Timeout o hang en respuestas largas en mobile."}'
```
