# Contract: POST /api/tickets

**Source**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-008, FR-009, C-003, C-004, C-006.

## Request

- Method: `POST`
- Path: `/api/tickets`
- Auth: none
- Content-Type: `application/json`
- Body: a `ComentarioAnalizado` **or** `{ "comentario": <ComentarioAnalizado> }`

```json
{
  "texto": "Grok se queda pensando 40 segundos…",
  "es_bug": true,
  "severity": "high",
  "feature": "latencia",
  "resumen": "Timeout o hang en respuestas largas en mobile."
}
```

## Success

- Status: `201`
- Content-Type: `application/json; charset=utf-8`
- CORS: same as comments API

```json
{
  "id": "T-1",
  "titulo": "Timeout o hang en respuestas largas en mobile.",
  "estado": "abierto",
  "severity": "high",
  "feature": "latencia",
  "es_bug": true,
  "resumen": "Timeout o hang en respuestas largas en mobile.",
  "textoOrigen": "Grok se queda pensando 40 segundos…",
  "createdAt": "2026-09-04T00:00:00.000Z"
}
```

## Invalid body

- Status: `400`
- Body: `{ "error": "<string>" }`
- No ticket created

## CORS preflight

- `OPTIONS` → 204
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods` includes `GET, POST, OPTIONS`
- `Access-Control-Allow-Headers` includes `Content-Type`
