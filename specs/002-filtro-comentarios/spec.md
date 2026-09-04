# Feature Specification: Filtro de comentarios (query AND)

**Feature Branch**: `002-filtro-comentarios`

**Created**: 2026-09-04

**Status**: Clarified

**Input**: User description: "Extender GET /api/comentarios con filtros opcionales severity, es_bug y feature (AND). Invalid → empty list o ignore unknown. Envelope igual. Server-side sobre el mock. Sin paginación. Persona A: server/ mock/."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filtrar el feed por severidad, bug y feature (Priority: P1)

Quien mira el feed (Persona B / demo) pide solo los comentarios que coinciden con uno o más criterios. El servidor recorta la lista actual; el cliente no filtra.

**Why this priority**: Sin esto el lote mock no se puede recortar para la demo “X → comentarios accionables”.

**Independent Test**: `GET /api/comentarios?severity=high` y comprobar que todo ítem tiene `severity: "high"` y el envelope sigue siendo `{ comentarios, updatedAt }`.

**Acceptance Scenarios**:

1. **Given** el mock tiene comentarios de varias severidades en la lista actual, **When** el cliente pide `GET /api/comentarios?severity=high`, **Then** HTTP 200 y cada elemento de `comentarios` tiene `severity` exactamente `high`.
2. **Given** la lista actual mezcla bugs y pedidos, **When** el cliente pide `?es_bug=true`, **Then** todos los ítems tienen `es_bug: true`.
3. **Given** hay un comentario con `feature: "latencia"`, **When** el cliente pide `?feature=Latencia` (mayúsculas / espacios), **Then** ese ítem entra y otro con feature distinta no.
4. **Given** el cliente combina `severity`, `es_bug` y `feature`, **When** pide los tres a la vez, **Then** solo entran ítems que cumplen **los tres** (AND).

---

### User Story 2 - Query desconocida o inválida no rompe el contrato (Priority: P1)

Un typo o un query extra no debe devolver 4xx ni un HTML. El envelope de spec 001 se mantiene.

**Why this priority**: Persona B ya trata 200 + JSON; un 400 nuevo rompería el poll.

**Independent Test**: pedir `?foo=bar` (ignore) y `?severity=critical` (no match → lista vacía).

**Acceptance Scenarios**:

1. **Given** un query key que no es `severity`, `es_bug` ni `feature`, **When** el cliente hace GET con esa key, **Then** HTTP 200 y la lista se filtra solo por las keys conocidas (la desconocida se ignora).
2. **Given** `severity` o `es_bug` con un valor que no está en el enum / boolean, **When** el cliente pide esa query, **Then** HTTP 200 con `comentarios: []` (no hay match).
3. **Given** cualquier filtro, **When** la respuesta es 200, **Then** el cuerpo tiene `comentarios` (array) y `updatedAt` (ISO-8601), y puede incluir `error` si el origen falló.

---

### User Story 3 - Sigue siendo el mismo recurso, sin páginas (Priority: P2)

El filtro no introduce cursor, `page` ni otro endpoint.

**Why this priority**: Spec 001 C-001 queda vigente.

**Independent Test**: `?page=2` se ignora (unknown key); la lista filtrada (o completa) se devuelve entera.

**Acceptance Scenarios**:

1. **Given** el cliente añade `page` o `cursor`, **When** hace GET, **Then** esas keys no paginan; se ignora el unknown y se aplica el resto.
2. **Given** no hay query de filtro, **When** hace `GET /api/comentarios`, **Then** el comportamiento de spec 001 no cambia (lista actual completa, mock default).

### Edge Cases

- `feature` vacío o solo espacios: treat as “no feature filter” (ignore that key).
- `severity` / `es_bug` present but blank or unknown token: no match → `comentarios: []`.
- `es_bug` MUST be the strings `true` or `false` (case-insensitive trim). `1` / `0` / `yes` → no match.
- `severity` MUST be `low` | `medium` | `high` (case-insensitive trim).
- Filtering MUST run on the current validated list (items that already passed `isComentarioAnalizado`), not on raw unvalidated pool rows.
- Methods other than GET on `/api/comentarios`: still MUST NOT be treated as success (spec 001).
- No authentication.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST keep exposing `GET /api/comentarios` as the read contract. Optional query filters MUST be applied server-side.
- **FR-002**: Successful responses MUST stay JSON `{ comentarios, updatedAt, error? }` with HTTP 200. No pagination fields.
- **FR-003**: Each element of `comentarios` MUST still satisfy `ComentarioAnalizado` (validated via `isComentarioAnalizado` before filtering).
- **FR-004**: Optional query `severity` MUST AND-match `low` | `medium` | `high` (case-insensitive trim). Invalid value → `comentarios: []`.
- **FR-005**: Optional query `es_bug` MUST AND-match `true` | `false` (case-insensitive trim → boolean). Invalid value → `comentarios: []`.
- **FR-006**: Optional query `feature` MUST AND-match the comment `feature` with exact equality after `trim` + case-insensitive compare. Empty/whitespace-only `feature` MUST be ignored.
- **FR-007**: Unknown query keys MUST be ignored. Known keys still AND together.
- **FR-008**: Data source remains the mock. The system MUST NOT call xAI, Linear, or Supabase to filter.
- **FR-009**: CORS MUST remain as in spec 001 (`Access-Control-Allow-Origin` allowing the PWA / local dev).
- **FR-010**: Persona A owns `server/` and `mock/` for this feature. `shared/types.js` MUST NOT change the `ComentarioAnalizado` shape.

### Key Entities

- **ComentarioAnalizado**: unchanged from spec 001 / constitution III.
- **FiltroComentarios**: optional `{ severity?, es_bug?, feature? }` parsed from the query string. Combined with AND.
- **Listado de comentarios**: same envelope as spec 001, after filters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `GET /api/comentarios?severity=high` returns only `high` items (or `[]` if none in the current list), HTTP 200, in under 2s locally.
- **SC-002**: `GET /api/comentarios?severity=nope` returns `{ comentarios: [], updatedAt }` with HTTP 200 (not 4xx).
- **SC-003**: `GET /api/comentarios?foo=bar` matches the unfiltered current list (unknown key ignored).
- **SC-004**: Combined `severity` + `es_bug` + `feature` returns the intersection, never a union.
- **SC-005**: Demo still works with mock default; no `XAI_API_KEY`, no Supabase.

## Assumptions

- Spec 001 stays Converged. This spec only *extends* the GET query; it does not rewrite 001.
- The “current list” is whatever the mock provider would return without filters (including the existing drip/batch behavior).
- Persona B / demo UI MAY send the query params; wiring the controls is authorized for the Juan demo exception in the constitution.
- Linear / paid APIs / Supabase remain out of scope.

## Clarifications

Session 2026-09-04. Decisions frozen before plan:

- **C-001 Combination**: filters AND together. Omit a key = do not constrain that field.
- **C-002 Unknown keys**: ignore. Do not 400.
- **C-003 Invalid severity / es_bug**: treat as no match → HTTP 200 + `comentarios: []`. Documented; empty list is OK.
- **C-004 Feature match**: exact string after trim, case-insensitive. Not substring, not glob.
- **C-005 Empty feature**: ignore the key (not a no-match).
- **C-006 Pagination**: still none (spec 001 C-001).
- **C-007 Envelope**: `{ comentarios, updatedAt, error? }` unchanged. HTTP 200 on the read path, including invalid filters.
- **C-008 When to filter**: after `isComentarioAnalizado` on the current list / validated mock pool. Never return a half-valid item that “matches” a filter.
- **C-009 Ownership**: Persona A (`server/`, `mock/`).
