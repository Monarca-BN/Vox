# Contract: POST /api/tickets/:id/cerrar

**Source**: FR-011, C-005, C-004.

## Request

- Method: `POST`
- Path: `/api/tickets/:id/cerrar` (example `/api/tickets/T-1/cerrar`)
- Auth: none
- Body: none required

## Success

- Status: `200`
- Body: the `TicketFingido` with `estado: "hecho"`
- CORS: same as comments API

## Missing id

- Status: `404`
- Body: `{ "error": "<string>" }`

Idempotent-enough: closing an already `hecho` ticket MAY return 200 with `estado: "hecho"` again.
