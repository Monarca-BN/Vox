# Tasks: Persona A — mock de comentarios de X

**Input**: Design documents from `/specs/001-persona-a-mock-comentarios/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: not requested in the spec — omit test-framework tasks.

**Scope**: Persona A only (`server/`, `mock/`). Do not edit `public/`.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

**Purpose**: Confirm the frozen tree exists.

- [x] T001 Confirm directories `server/`, `mock/`, `shared/` exist at repo root per plan.md
- [x] T002 Confirm `package.json` has `"type": "module"` and start script `node server/index.js`

---

## Phase 2: Foundational

**Purpose**: Contract + mock pool. Blocks user stories.

- [x] T003 Keep `ComentarioAnalizado` and `isComentarioAnalizado` in `shared/types.js` (texto, es_bug, severity enum, feature, resumen)
- [x] T004 [P] Fill `mock/comentarios.json` with multiple fake X-style posts covering bugs and non-bugs and low/medium/high

**Checkpoint**: contract and pool exist without an HTTP server

---

## Phase 3: User Story 1 — Consumir comentarios simulados (P1) 🎯 MVP

**Goal**: `GET /api/comentarios` returns the envelope from the mock.

**Independent Test**: `GET http://localhost:3000/api/comentarios` → 200 + `comentarios` + `updatedAt`

- [x] T005 [US1] Implement mock reader in `server/mock.js`: load `mock/comentarios.json`, drop invalid items via `isComentarioAnalizado`, return `{ comentarios, updatedAt }`
- [x] T006 [US1] Default `server/provider.js` to the mock path (xAI stub MUST NOT run by default)
- [x] T007 [US1] Serve `GET /api/comentarios` in `server/index.js` as JSON with CORS (FR-001, FR-007)
- [x] T008 [US1] Ignore query pagination; return the current list in full (C-001)

**Checkpoint**: Persona B can render a feed with no `XAI_API_KEY`

---

## Phase 4: User Story 2 — Los comentarios parecen posts de X (P1)

**Goal**: payload looks like real user posts, not fixtures-as-ids.

**Independent Test**: inspect `comentarios[].texto` and mix of `es_bug` / `severity`

- [x] T009 [US2] Ensure every `texto` in `mock/comentarios.json` is natural-language user speech
- [x] T010 [US2] Ensure the pool includes `es_bug: true` and `es_bug: false` and all three severities (FR-005)

**Checkpoint**: demo feed reads as filtered X, not lorem ipsum

---

## Phase 5: User Story 3 — Fallo degradado (P2)

**Goal**: mock read failure still returns JSON Persona B can show.

**Independent Test**: force a mock read error; GET still 200 with `comentarios` array and `error` string

- [x] T011 [US3] In `server/index.js` / `server/mock.js`, on failure return HTTP 200 JSON `{ comentarios, updatedAt, error }` (C-002, FR-006)
- [x] T012 [US3] Non-GET to `/api/comentarios` MUST NOT be treated as success

**Checkpoint**: B can show an error state without a blank body

---

## Phase 6: Polish

- [x] T013 Confirm `server/xai.js` is not on the default path (C-005, SC-004)
- [x] T014 Run `quickstart.md`: two GETs in a row, each < 2s, 100% items pass the contract (SC-002, SC-003)

---

## Dependencies

- Phase 1 → Phase 2 → US1 (Phase 3) → US2 / US3
- US2 can start after T004; US3 after T007
- Persona A does not take tasks in `public/`

## Implementation note

Existing code on `main` MAY already satisfy some tasks. Do not rewrite working files. Check off a task only when the live code matches the spec/plan. Gaps go to implement/converge, not to silent extra features.
