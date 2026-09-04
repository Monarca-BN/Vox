# Tasks: Filtro de comentarios

**Input**: Design documents from `/specs/002-filtro-comentarios/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: not requested — omit test-framework tasks. Verify with quickstart curls.

**Scope**: Persona A (`server/`, `mock/`). `shared/types.js` read-only. Minimal `public/` only under constitution II demo exception (see spec 003 / Juan demo).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

**Purpose**: Keep the 001 tree; add a filter module.

- [x] T001 Confirm `server/index.js`, `server/mock.js`, `server/provider.js`, `shared/types.js` exist (spec 001)
- [x] T002 [P] Add `server/filters.js` exporting `applyComentarioFilters(comentarios, searchParams)`

---

## Phase 2: Foundational

**Purpose**: Parse and AND-filter without changing the envelope.

- [x] T003 Implement severity / es_bug / feature rules in `server/filters.js` (C-001–C-005, FR-004–FR-007)
- [x] T004 Unknown keys ignored; invalid severity/es_bug → `[]`; blank feature ignored

**Checkpoint**: helper is unit-testable by importing it from a REPL; no HTTP yet

---

## Phase 3: User Story 1 — Filtrar el feed (P1) 🎯 MVP

**Goal**: GET applies filters server-side on the validated current list.

**Independent Test**: `GET /api/comentarios?severity=high` → 200, all high (or empty)

- [x] T005 [US1] In `server/index.js`, pass `url.searchParams` through `applyComentarioFilters` after `getComentarios()`
- [x] T006 [US1] Keep HTTP 200 envelope `{ comentarios, updatedAt, error? }` (FR-002)
- [x] T007 [US1] Do not paginate; return the filtered current list in full (C-006)

**Checkpoint**: AND combos work via curl

---

## Phase 4: User Story 2 — Query inválida no rompe el contrato (P1)

**Goal**: unknown / invalid query still 200 JSON.

**Independent Test**: `?severity=critical` → `[]`; `?foo=bar` → unfiltered current list

- [x] T008 [US2] Invalid `severity` or `es_bug` → 200 + `comentarios: []` (C-003)
- [x] T009 [US2] Unknown keys do not 400 (C-002)
- [x] T010 [US2] CORS unchanged (FR-009)

**Checkpoint**: Persona B poll path still only needs 200 + JSON

---

## Phase 5: User Story 3 — Mismo recurso, sin páginas (P2)

- [x] T011 [US3] Non-GET `/api/comentarios` still not success (405)
- [x] T012 [US3] Unfiltered GET behavior of spec 001 unchanged when no known filter keys

---

## Phase 6: Polish

- [x] T013 Confirm `server/provider.js` still defaults to mock (FR-008, SC-005)
- [x] T014 Run `quickstart.md` curls locally

---

## Dependencies

- Phase 1 → Phase 2 → US1 → US2 / US3
- Demo UI filter controls live in spec 003 tasks (same PR) under the constitution demo exception

## Implementation note

Do not rewrite spec 001 files. Do not add npm dependencies.

Analyze 2026-09-04 (`main` @ `25147a6` + live curls): T001–T014 remain DONE. See [analyze-report.md](./analyze-report.md).
