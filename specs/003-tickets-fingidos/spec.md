# Feature Specification: Tickets fingidos (no Linear)

**Feature Branch**: `003-tickets-fingidos`

**Created**: 2026-09-04

**Status**: Clarified

**Input**: User description: "Tickets fingidos, no Linear. Store in-memory. Entidad TicketFingido. POST /api/tickets con ComentarioAnalizado → 201. GET /api/tickets → { tickets, updatedAt }. Body inválido → 400 { error }. CORS igual. Opcional cerrar ticket. Demo mock-only."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un ticket fingido desde un comentario (Priority: P1)

Juan (o la PWA) toma un `ComentarioAnalizado` del feed y lo convierte en un ticket accionable. No se crea un issue en Linear ni se llama a xAI.

**Why this priority**: Es el paso “comentarios → tickets” de la demo.

**Independent Test**: `POST /api/tickets` with a valid comment JSON → HTTP 201 and a `TicketFingido`.

**Acceptance Scenarios**:

1. **Given** un body que es un `ComentarioAnalizado` válido, **When** el cliente hace `POST /api/tickets`, **Then** HTTP 201 y un ticket con `estado: "abierto"`, `id` string, `titulo` derivado, `severity`/`feature`/`es_bug`/`resumen` copiados, `textoOrigen` = `texto`, `createdAt` ISO-8601.
2. **Given** un body `{ "comentario": <ComentarioAnalizado> }`, **When** hace POST, **Then** el mismo resultado 201 (wrapper aceptado).
3. **Given** el proceso sigue vivo, **When** se crea un segundo ticket, **Then** recibe un `id` distinto.

---

### User Story 2 - Listar tickets de esta sesión (Priority: P1)

La demo muestra los tickets fingidos creados mientras corre `node server/index.js`.

**Why this priority**: Sin listado no hay tablero falso que enseñar.

**Independent Test**: crear uno, luego `GET /api/tickets` y verlo en `tickets[]`.

**Acceptance Scenarios**:

1. **Given** no se ha creado ninguno desde que arrancó el proceso, **When** `GET /api/tickets`, **Then** HTTP 200 `{ tickets: [], updatedAt }`.
2. **Given** se crearon N tickets, **When** `GET /api/tickets`, **Then** `tickets` tiene esos N objetos `TicketFingido` y `updatedAt` es ISO-8601.
3. **Given** el proceso se reinicia, **When** se vuelve a listar, **Then** la lista está vacía (memoria de proceso, no disco / no Supabase).

---

### User Story 3 - Rechazar basura sin mentir un 201 (Priority: P1)

Un POST mal armado no debe inventar un ticket.

**Why this priority**: contrato claro para la PWA.

**Independent Test**: `POST /api/tickets` with `{}` → HTTP 400 `{ error }`.

**Acceptance Scenarios**:

1. **Given** JSON que no pasa `isComentarioAnalizado` (ni en root ni en `.comentario`), **When** POST, **Then** HTTP 400 y `{ "error": <string> }` sin crear fila.
2. **Given** body que no es JSON, **When** POST, **Then** HTTP 400 `{ error }`.

---

### User Story 4 - Cerrar un ticket fingido (Priority: P2)

Marcar `estado` como `hecho` para la demo, sin Linear.

**Why this priority**: small extra; create+list already satisfy the slice if this is skipped — included because it is small.

**Independent Test**: crear, `POST /api/tickets/{id}/cerrar`, ver `estado: "hecho"`.

**Acceptance Scenarios**:

1. **Given** un ticket existente `abierto`, **When** `POST /api/tickets/{id}/cerrar`, **Then** HTTP 200 y el ticket con `estado: "hecho"`.
2. **Given** un `id` desconocido, **When** se intenta cerrar, **Then** HTTP 404 `{ error }`.

### Edge Cases

- Store lives only while the Node process runs. No file, no Supabase, no Linear.
- `titulo`: use trimmed `resumen` if non-empty; otherwise first ~80 characters of `texto`. Do not require a separate title field on the request.
- `id`: string, e.g. `T-` + increment (or uuid). Stable for the process lifetime.
- Duplicate POSTs of the same comment MAY create two tickets (no dedup required).
- CORS MUST match the comments API (`Access-Control-Allow-Origin`, OPTIONS preflight for POST).
- GET/POST `/api/tickets` have no auth.
- Closing is optional-but-included: `POST /api/tickets/:id/cerrar` only (no PATCH required).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose `POST /api/tickets` that accepts JSON `ComentarioAnalizado` or `{ comentario: ComentarioAnalizado }`.
- **FR-002**: A valid POST MUST create a `TicketFingido` in an in-memory store and return HTTP 201 + the ticket JSON.
- **FR-003**: `TicketFingido` MUST include `id`, `titulo`, `estado`, `severity`, `feature`, `es_bug`, `resumen`, `textoOrigen`, `createdAt`.
- **FR-004**: `estado` on create MUST be `abierto`. Allowed values: `abierto` | `hecho`.
- **FR-005**: `id` MUST be a string unique in the process (`T-` + increment is sufficient).
- **FR-006**: `titulo` MUST be derived from `resumen`, or the first ~80 characters of `texto` if resumen were unusable (resumen is required on the comment; still derive from it).
- **FR-007**: `GET /api/tickets` MUST return HTTP 200 `{ tickets, updatedAt }`.
- **FR-008**: Invalid body or invalid JSON MUST return HTTP 400 `{ error }` and MUST NOT create a ticket.
- **FR-009**: CORS MUST be the same policy as `GET /api/comentarios`, including OPTIONS that allows POST.
- **FR-010**: The system MUST NOT call Linear, xAI, or Supabase. Tickets MUST NOT persist across process restart.
- **FR-011**: System MUST expose `POST /api/tickets/:id/cerrar` to set `estado=hecho` (200 + ticket) or 404 `{ error }` if missing.

### Key Entities

- **ComentarioAnalizado**: input; unchanged contract (spec 001).
- **TicketFingido**: fake work item `{ id, titulo, estado, severity, feature, es_bug, resumen, textoOrigen, createdAt }`.
- **Store in-memory**: array (or map) in the Node process. Lost on exit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From a cold `node server/index.js`, POST one valid comment → 201 ticket, GET lists exactly that ticket, in under 2s each locally.
- **SC-002**: Invalid POST never returns 201 and GET count stays unchanged.
- **SC-003**: Restarting the process empties `GET /api/tickets`.
- **SC-004**: No outbound call to Linear, `api.x.ai`, or Supabase on create/list/close.
- **SC-005**: Demo UI can create a ticket from a card and show it in a tickets section (minimal `public/` per constitution II exception).

## Assumptions

- Spec 001/002 remain the comment source. This spec does not change filter semantics.
- In-memory is enough for the hackathon demo. Juan asked for fake tickets only.
- Persona A owns `server/` (new `server/tickets.js`). `public/` may receive minimal demo wiring with Juan’s approval.

## Clarifications

Session 2026-09-04. Decisions frozen before plan:

- **C-001 Not Linear**: tickets are fake. No Linear token, no issue URL.
- **C-002 Store**: in-memory only; survives while the process runs.
- **C-003 Body shapes**: raw `ComentarioAnalizado` **or** `{ comentario: ComentarioAnalizado }`.
- **C-004 Errors**: invalid body → 400 JSON `{ error }`. Missing close target → 404 `{ error }`.
- **C-005 Close**: include `POST /api/tickets/:id/cerrar` (small). Skip PATCH.
- **C-006 CORS**: same as comments API; OPTIONS MUST allow POST (and GET).
- **C-007 Id**: `T-` + increment is the default scheme.
- **C-008 Titulo**: from `resumen` (trim); fallback first ~80 chars of `texto`.

### Addendum (2026-09-04) — UI no longer creates tickets

Juan: tickets are already created and **are what is arriving in the feed**. See [amendment-ui.md](./amendment-ui.md).

- The PWA MUST NOT expose **Crear ticket** or a separate **Tickets fingidos** list.
- Feed cards are the work items. Filters + feed stay.
- Spec 003 API (`GET`/`POST` `/api/tickets`, `cerrar`) MAY remain for a later auto-threshold; the UI does not call it.
