# Data model: 003-tickets-fingidos

## ComentarioAnalizado (input)

Unchanged. Validated with `isComentarioAnalizado` before create.

## TicketFingido

In-memory only. Not a Linear issue.

| Field | Type | Rules |
| --- | --- | --- |
| id | string | unique in process; `T-` + increment |
| titulo | string | from `resumen` trim, else first ~80 chars of `texto` |
| estado | enum | `abierto` \| `hecho` (create → `abierto`) |
| severity | enum | copied from comment: `low` \| `medium` \| `high` |
| feature | string | copied from comment |
| es_bug | boolean | copied from comment |
| resumen | string | copied from comment |
| textoOrigen | string | copied from comment `texto` |
| createdAt | string | ISO-8601 at create time |

## Store

- Module singleton in `server/tickets.js`.
- Survives only while the Node process runs.
- `updatedAt` for `GET /api/tickets` is ISO-8601 of last create/close (or process start if empty).

## Listado (GET envelope)

| Field | Type | Rules |
| --- | --- | --- |
| tickets | TicketFingido[] | insertion order |
| updatedAt | string | ISO-8601 |

## Error body

| Field | Type | When |
| --- | --- | --- |
| error | string | POST invalid (400); close missing id (404) |
