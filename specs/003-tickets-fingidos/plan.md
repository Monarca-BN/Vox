# Implementation Plan: Tickets fingidos

**Branch**: `003-tickets-fingidos` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-tickets-fingidos/spec.md`

## Summary

Tickets fingidos en memoria de proceso. `POST /api/tickets` crea desde un `ComentarioAnalizado`. `GET /api/tickets` lista. `POST /api/tickets/:id/cerrar` marca `hecho`. 400/404 JSON `{ error }`. CORS como comentarios. Cero Linear / xAI / Supabase.

Approach: `server/tickets.js` (stdlib Map/array + increment id). Wire routes in `server/index.js`. Read JSON body from the request stream. Minimal `public/` for Juan’s demo.

## Technical Context

**Language/Version**: Node.js 20+ (ESM)

**Primary Dependencies**: Node stdlib only (`http`). Reuse `isComentarioAnalizado` from `shared/types.js`

**Storage**: in-memory array in `server/tickets.js` (no file, no DB)

**Testing**: manual curl (POST/GET/cerrar) + browser demo

**Target Platform**: local `http://localhost:3000`

**Project Type**: small HTTP service + static PWA

**Performance Goals**: each call < 2s locally (SC-001)

**Constraints**: no npm deps; no paid APIs; A owns server; demo exception for public/

**Scale/Scope**: tens of tickets per process, one demo operator

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec-first: plan traces to spec 003 + C-001–C-008. PASS
- File ownership: `server/tickets.js` + `server/index.js`; `public/` only via II exception. PASS
- Frozen contract: POST consumes `ComentarioAnalizado` as-is. PASS
- Mock-first / no paid APIs / no Supabase: in-memory only. PASS
- Fake tickets (principle VI): this is the implementation of that principle. PASS
- Traceability: routes map to FR-001–FR-011. PASS

## Project Structure

### Documentation (this feature)

```text
specs/003-tickets-fingidos/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── post-api-tickets.md
│   ├── get-api-tickets.md
│   └── post-api-tickets-id-cerrar.md
└── tasks.md
```

### Source Code (authorized)

```text
server/
├── tickets.js            # in-memory store + create / list / close
├── index.js              # POST/GET /api/tickets, POST /api/tickets/:id/cerrar, CORS
shared/
└── types.js              # isComentarioAnalizado (read). Optional TicketFingido typedef only if non-breaking
public/                   # MINIMAL demo: filters + Crear ticket + lista (constitution II exception)
├── index.html
├── app.js
└── styles.css
```

**Structure Decision**: new `server/tickets.js`. Do not add Express, uuid package, or Supabase client.

## Complexity Tracking

> `public/` edits are an explicit constitution II demo exception (Juan). Called out in the PR, not hidden.
