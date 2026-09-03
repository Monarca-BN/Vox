# Contract: GET /api/comentarios

**Source**: FR-001, FR-002, FR-003, FR-006, FR-007, C-001, C-002, C-003.

## Request

- Method: `GET`
- Path: `/api/comentarios`
- Auth: none
- Query: none (no pagination)

## Success

- Status: `200`
- Content-Type: `application/json; charset=utf-8`
- CORS: allow the PWA (same origin / local dev)

```json
{
  "comentarios": [
    {
      "texto": "string non-empty",
      "es_bug": true,
      "severity": "high",
      "feature": "latencia",
      "resumen": "string non-empty"
    }
  ],
  "updatedAt": "2026-09-03T00:00:00.000Z"
}
```

## Degraded read failure

- Status: `200`
- Body: `{ "comentarios": [], "updatedAt": "<iso>", "error": "<string>" }`

## Other methods

Non-GET MUST NOT be treated as success for this resource.
