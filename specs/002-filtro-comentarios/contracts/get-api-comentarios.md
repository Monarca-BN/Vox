# Contract: GET /api/comentarios (extended query)

**Source**: spec 002 FR-001–FR-009, C-001–C-008. Extends `specs/001-persona-a-mock-comentarios/contracts/get-api-comentarios.md`. Does not replace the 001 envelope.

## Request

- Method: `GET`
- Path: `/api/comentarios`
- Auth: none
- Query (all optional, AND):

| Key | Values | Notes |
| --- | --- | --- |
| `severity` | `low` \| `medium` \| `high` | case-insensitive trim; invalid → empty list |
| `es_bug` | `true` \| `false` | case-insensitive trim; invalid → empty list |
| `feature` | string | exact match after trim, case-insensitive; blank → ignore |

Unknown keys: ignore. No pagination.

## Success (including “no match”)

- Status: `200`
- Content-Type: `application/json; charset=utf-8`
- CORS: same as spec 001 (`Access-Control-Allow-Origin` for PWA / local)

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
  "updatedAt": "2026-09-04T00:00:00.000Z"
}
```

Examples:

- `GET /api/comentarios` — current list (spec 001).
- `GET /api/comentarios?severity=high` — only high.
- `GET /api/comentarios?severity=high&es_bug=true&feature=latencia` — intersection.
- `GET /api/comentarios?severity=critical` — `{ "comentarios": [], "updatedAt": "<iso>" }`.
- `GET /api/comentarios?foo=1` — unknown ignored; same as unfiltered current list.

## Degraded read failure

- Status: `200`
- Body: `{ "comentarios": [], "updatedAt": "<iso>", "error": "<string>" }`
- Filters MAY still run on the (possibly empty) array.

## Other methods

Non-GET MUST NOT be treated as success for this resource.
