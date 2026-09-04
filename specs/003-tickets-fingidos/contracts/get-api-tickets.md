# Contract: GET /api/tickets

**Source**: FR-007, FR-009, FR-010, C-002.

## Request

- Method: `GET`
- Path: `/api/tickets`
- Auth: none
- Query: none (no pagination)

## Success

- Status: `200`
- Content-Type: `application/json; charset=utf-8`
- CORS: same as comments API

```json
{
  "tickets": [
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
  ],
  "updatedAt": "2026-09-04T00:00:00.000Z"
}
```

Cold process: `{ "tickets": [], "updatedAt": "<iso>" }`.
Restarting the process resets the list.
