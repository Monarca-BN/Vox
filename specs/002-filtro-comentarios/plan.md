# Implementation Plan: Filtro de comentarios

**Branch**: `002-filtro-comentarios` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-filtro-comentarios/spec.md`

## Summary

Extender `GET /api/comentarios` con query opcional `severity`, `es_bug`, `feature` (AND). Filtrar en el servidor la lista mock ya validada. Keys desconocidas se ignoran. `severity`/`es_bug` inválidos → lista vacía, HTTP 200. Sin paginación. Sin xAI / Linear / Supabase.

Approach: parse `URLSearchParams` in `server/index.js`, apply a small filter helper on the envelope from `getComentarios()`.

## Technical Context

**Language/Version**: Node.js 20+ (ESM, `"type": "module"`)

**Primary Dependencies**: Node stdlib only (`http`, `url`)

**Storage**: same `mock/comentarios.json` + in-memory drip cache from spec 001

**Testing**: manual curl / `GET` with query strings (no test framework)

**Target Platform**: local, `http://localhost:3000`

**Project Type**: small HTTP service + static `public/`

**Performance Goals**: each GET < 2s locally (SC-001)

**Constraints**: no outbound paid APIs; A owns `server/` `mock/`; `ComentarioAnalizado` frozen

**Scale/Scope**: three optional query keys, tens of mock comments

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec-first: plan traces to spec 002 + C-001–C-009. PASS
- File ownership: `server/` (+ demo exception for `public/` documented in 002 tasks / PR). PASS
- Frozen contract: filter does not add required fields to `ComentarioAnalizado`. PASS
- Mock-first / mock-only demo: filter runs on mock list; no xAI/Supabase. PASS
- Fake tickets: out of this spec (see 003). PASS
- Traceability: filter helper + GET wiring map to FR-001–FR-010. PASS

## Project Structure

### Documentation (this feature)

```text
specs/002-filtro-comentarios/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── get-api-comentarios.md
└── tasks.md
```

### Source Code (authorized)

```text
server/
├── index.js              # parse query, apply filters, keep envelope
├── filters.js            # applyComentarioFilters(list, searchParams)
├── mock.js               # unchanged drip; still validates via isComentarioAnalizado
└── provider.js           # still mock by default
shared/
└── types.js              # read-only for this spec (contract frozen)
```

**Structure Decision**: add `server/filters.js` rather than grow `mock.js`. Do not add npm deps.

## Complexity Tracking

> No constitution violations. Demo `public/` edits (if any) are the documented exception in constitution II, not a silent breach.
