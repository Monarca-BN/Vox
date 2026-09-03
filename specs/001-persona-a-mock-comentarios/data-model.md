# Data model: 001-persona-a-mock-comentarios

## ComentarioAnalizado

Shared contract (A ↔ B). Source of validation: `shared/types.js`.

| Field | Type | Rules |
| --- | --- | --- |
| texto | string | non-empty after trim |
| es_bug | boolean | true = bug report, false = feature/request |
| severity | enum | `low` \| `medium` \| `high` |
| feature | string | non-empty after trim |
| resumen | string | non-empty after trim |

No extra fields are required. Extra fields MAY exist but B is not required to use them.

## Listado (response envelope)

| Field | Type | Rules |
| --- | --- | --- |
| comentarios | ComentarioAnalizado[] | only valid items |
| updatedAt | string | ISO-8601 |
| error | string | optional; present on mock/read failure |

## Pool mock

File `mock/comentarios.json`: JSON array of ComentarioAnalizado.
MUST include multiple items, both `es_bug` values, and all three severities (FR-005).
