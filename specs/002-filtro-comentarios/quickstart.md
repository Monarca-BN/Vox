# Quickstart — filtro de comentarios

1. From repo root: `node server/index.js`
2. `GET http://localhost:3000/api/comentarios` — envelope `{ comentarios, updatedAt }`, mock only
3. `GET http://localhost:3000/api/comentarios?severity=high` — only `severity: "high"`
4. `GET http://localhost:3000/api/comentarios?es_bug=false` — only feature requests
5. `GET http://localhost:3000/api/comentarios?feature=latencia` — exact feature, case-insensitive
6. Combine: `?severity=high&es_bug=true&feature=latencia`
7. Invalid: `?severity=critical` → HTTP 200 and `comentarios: []`
8. Unknown: `?foo=bar` → ignored (same list as step 2 on that process state)
9. Confirm no call to `api.x.ai`, Linear, or Supabase

The mock may drip items over repeated GETs (spec 001). Filters apply to the current validated list after each drip.
