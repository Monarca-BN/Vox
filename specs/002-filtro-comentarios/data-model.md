# Data model: 002-filtro-comentarios

## ComentarioAnalizado

Unchanged. Source of validation: `shared/types.js` `isComentarioAnalizado`.

| Field | Type | Rules |
| --- | --- | --- |
| texto | string | non-empty after trim |
| es_bug | boolean | true = bug, false = feature/request |
| severity | enum | `low` \| `medium` \| `high` |
| feature | string | non-empty after trim |
| resumen | string | non-empty after trim |

## FiltroComentarios (query)

All fields optional. Combined with AND. Parsed from the query string only.

| Field | Query key | Accepted values | Invalid / empty behavior |
| --- | --- | --- | --- |
| severity | `severity` | `low`, `medium`, `high` (trim, case-insensitive) | any other non-absent value → no match (`[]`) |
| es_bug | `es_bug` | `true`, `false` (trim, case-insensitive) | any other non-absent value → no match (`[]`) |
| feature | `feature` | string; compare trim + lower vs `ComentarioAnalizado.feature` | whitespace-only → ignore key |

Unknown keys are not part of this entity.

## Listado (response envelope)

Same as spec 001:

| Field | Type | Rules |
| --- | --- | --- |
| comentarios | ComentarioAnalizado[] | validated, then filtered |
| updatedAt | string | ISO-8601 (from the provider; filters do not invent a new clock unless the provider does) |
| error | string | optional; still used on mock/read failure |

No `page`, `cursor`, or `total` fields.
