# Feature Specification: Persona A — mock de comentarios de X

**Feature Branch**: `001-persona-a-mock-comentarios`

**Created**: 2026-09-03

**Status**: Clarified

**Input**: User description: "Persona A entrega comentarios analizados con un mock que finge mensajes de X. Endpoint GET /api/comentarios. Contrato ComentarioAnalizado. Sin xAI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consumir comentarios simulados (Priority: P1)

La interfaz (Persona B) pide la lista de comentarios analizados y recibe un lote listo para pintar, sin esperar a X ni a un modelo.

**Why this priority**: Es el contrato mínimo para que A y B trabajen en paralelo.

**Independent Test**: Pedir la lista una vez y verificar que cada ítem cumple el contrato `ComentarioAnalizado`.

**Acceptance Scenarios**:

1. **Given** el servicio de Persona A está disponible, **When** un cliente hace `GET /api/comentarios`, **Then** la respuesta es HTTP 200 y un objeto con una lista `comentarios`.
2. **Given** hay comentarios en el mock, **When** el cliente lee `comentarios`, **Then** cada elemento tiene `texto`, `es_bug`, `severity`, `feature` y `resumen` válidos.
3. **Given** el cliente de Persona B hace polling periódico, **When** vuelve a pedir la lista, **Then** recibe JSON válido otra vez (no se cae el contrato).

---

### User Story 2 - Los comentarios parecen posts de X (Priority: P1)

Los ítems del mock se leen como quejas o pedidos reales publicados en X sobre un producto (texto en lenguaje natural, no lorem ipsum).

**Why this priority**: La demo tiene que verse como feed de X filtrado, aunque los datos sean fingidos.

**Independent Test**: Abrir el mock/listado y comprobar que hay varios comentarios con texto de usuario, feature y resumen.

**Acceptance Scenarios**:

1. **Given** el pool mock, **When** se listan los comentarios, **Then** hay más de un ítem y cada `texto` parece un mensaje de usuario, no un identificador técnico.
2. **Given** el pool mock, **When** se revisan los campos, **Then** hay tanto ítems con `es_bug: true` como ítems con `es_bug: false`, y `severity` usa solo `low`, `medium` o `high`.

---

### User Story 3 - Fallo degradado, no pantalla muerta (Priority: P2)

Si el mock no se puede leer, el cliente todavía recibe una respuesta útil (lista vacía y señal de error), no un fallo opaco.

**Why this priority**: Persona B tiene que poder mostrar estado de error en la demo.

**Independent Test**: Forzar un error de lectura del mock y observar el cuerpo de `GET /api/comentarios`.

**Acceptance Scenarios**:

1. **Given** el origen mock falla, **When** el cliente pide `GET /api/comentarios`, **Then** la respuesta sigue siendo JSON con `comentarios` (posiblemente vacío) y un campo `error` descriptivo.

### Edge Cases

- Ítem del mock que no cumple el contrato: MUST be omitted from `comentarios`, not returned half-valid.
- Lista vacía válida: HTTP 200 with `comentarios: []` and no `error` is allowed if the pool has nothing valid yet.
- Methods other than GET on `/api/comentarios`: MUST NOT be treated as success.
- There is no authentication in this slice.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose `GET /api/comentarios` as the only contract Persona B uses to read comments.
- **FR-002**: Successful responses MUST be JSON objects with `comentarios` (array) and `updatedAt` (ISO-8601 timestamp).
- **FR-003**: Each element of `comentarios` MUST satisfy `ComentarioAnalizado`: non-empty `texto`, boolean `es_bug`, `severity` ∈ {low, medium, high}, non-empty `feature`, non-empty `resumen`.
- **FR-004**: Comment bodies MUST come from a local mock that fakes X posts. The system MUST NOT call xAI, `x_search`, or the live X API in this slice.
- **FR-005**: The mock MUST include multiple comments covering bugs and non-bugs, and all three severities.
- **FR-006**: On mock/read failure the system MUST still return JSON with `comentarios` (array, may be empty) and `error` (string), without requiring Persona B to parse HTML or an empty body.
- **FR-007**: CORS MUST allow the PWA on the same origin (and local dev) to call `GET /api/comentarios`.

### Key Entities

- **ComentarioAnalizado**: un comentario ya filtrado/estructurado. Campos: `texto`, `es_bug`, `severity`, `feature`, `resumen`.
- **Listado de comentarios**: respuesta de `GET /api/comentarios` con `comentarios[]` y `updatedAt`. Puede incluir `error` si el origen falló.
- **Pool mock**: conjunto local de comentarios fingidos que simulan posts de X. No es una base de datos persistente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Persona B can render a feed from a single `GET /api/comentarios` with no xAI key configured.
- **SC-002**: 100% of items in `comentarios` pass the `ComentarioAnalizado` contract.
- **SC-003**: A client can call the endpoint twice in a row and get valid JSON both times in under 2 seconds per call on local machine.
- **SC-004**: Demo works with `XAI_API_KEY` unset; no outbound call to `api.x.ai` occurs on `GET /api/comentarios`.

## Assumptions

- Persona B owns the PWA (`public/`) and will poll; this spec does not define UI.
- Same-origin local server is how A and B integrate (`node server/index.js`, `http://localhost:3000`).
- Linear, Slack, real X ingestion, and persistent storage remain out of scope.
- Existing stub files for xAI, if present, MUST NOT become the default path for this slice.
- Dripping/batching extra mock comments over time is an implementation detail unless a later spec amendment requires a live-looking feed.

## Clarifications

Session 2026-09-03. Decisions frozen before plan:

- **C-001 Pagination**: none. `GET /api/comentarios` returns the current list in full, not pages or cursors.
- **C-002 Transport of errors**: on mock/read failure, HTTP status stays 200 and the JSON includes `error` (string) plus `comentarios` (array, possibly empty). Persona B MUST NOT need a 5xx to show degraded state.
- **C-003 Push vs pull**: Persona A does not push. Persona B MAY poll. Repeated GET MUST be safe and keep the same contract.
- **C-004 Mock theme**: items MUST read as user posts about a software product (bugs and feature requests), not lorem ipsum or internal ids.
- **C-005 Default path**: mock is the only authorized source in this slice. An xAI stub MAY exist but MUST NOT run unless a later spec amendment says so.
