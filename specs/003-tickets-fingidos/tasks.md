# Tasks: Tickets fingidos

**Input**: Design documents from `/specs/003-tickets-fingidos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: not requested — verify with quickstart curls + browser demo.

**Scope**: Persona A `server/` (+ `shared/types.js` only if adding a non-breaking typedef). Minimal `public/` under constitution II demo exception.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Add `server/tickets.js` with an empty in-memory list and incrementing `T-` ids
- [x] T002 [P] Export `createTicket`, `listTickets`, `cerrarTicket` from `server/tickets.js`

---

## Phase 2: Foundational

- [x] T003 Derive `titulo` from `resumen` or first ~80 chars of `texto` (C-008)
- [x] T004 New tickets start as `estado: "abierto"` with ISO `createdAt` (FR-003, FR-004)
- [x] T005 In `server/index.js`, allow CORS OPTIONS methods `GET, POST, OPTIONS` and header `Content-Type` (FR-009)

**Checkpoint**: store module exists; HTTP not wired

---

## Phase 3: User Story 1 — Crear ticket (P1) 🎯 MVP

**Goal**: POST a comment → 201 TicketFingido

**Independent Test**: curl POST valid body → 201 + `id` `T-1`

- [x] T006 [US1] Parse JSON body in `server/index.js` (stdlib stream)
- [x] T007 [US1] Accept raw `ComentarioAnalizado` or `{ comentario }` via `isComentarioAnalizado` (C-003)
- [x] T008 [US1] `POST /api/tickets` → 201 + ticket (FR-001, FR-002)

**Checkpoint**: create works without UI

---

## Phase 4: User Story 2 — Listar tickets (P1)

**Goal**: GET envelope of this process’s tickets

**Independent Test**: GET after create lists the ticket; GET on cold process is `[]`

- [x] T009 [US2] `GET /api/tickets` → 200 `{ tickets, updatedAt }` (FR-007)
- [x] T010 [US2] Store MUST reset on process restart (no file write)

**Checkpoint**: create + list is enough for a terminal demo

---

## Phase 5: User Story 3 — Body inválido (P1)

- [x] T011 [US3] Invalid object / missing fields → 400 `{ error }` (FR-008)
- [x] T012 [US3] Invalid JSON → 400 `{ error }`
- [x] T013 [US3] Confirm no ticket is created on 400 (GET count unchanged)

---

## Phase 6: User Story 4 — Cerrar (P2)

- [x] T014 [US4] `POST /api/tickets/:id/cerrar` → 200 ticket `estado=hecho` (FR-011)
- [x] T015 [US4] Unknown id → 404 `{ error }`

---

## Phase 7: Demo UI (constitution II exception)

Juan asked for an end-to-end mock demo. Minimal `public/` only.

- [x] T016 [P] Filter controls (severity / es_bug / feature) call `GET /api/comentarios` with query params (spec 002)
- [x] T017 Each card has **Crear ticket** → `POST /api/tickets` with that comentario
- [x] T018 Tickets section lists `GET /api/tickets` (optional Cerrar → `/cerrar`)
- [x] T019 Note in the PR that `public/` was touched with Juan’s approval

---

## Phase 8: Polish

- [x] T020 Do not call xAI; keep mock default (FR-010)
- [x] T021 Run `quickstart.md` (API + `http://localhost:3000`)
- [x] T022 No new npm dependencies

---

## Dependencies

- Phase 1 → 2 → US1 → US2 / US3; US4 after US1
- Demo UI after US1+US2 (and spec 002 filter helper)
- Same PR as spec 002 implementation

## Implementation note

Do not add Linear, Supabase, or uuid packages. Prefer stdlib.

Analyze 2026-09-04 (`main` @ `25147a6` + live curls): T001–T022 remain DONE. See [analyze-report.md](./analyze-report.md).
