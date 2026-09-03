# Implementation Plan: Persona A — mock de comentarios de X

**Branch**: `001-persona-a-mock-comentarios` | **Date**: 2026-09-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-persona-a-mock-comentarios/spec.md`

## Summary

Persona A sirve `GET /api/comentarios` desde un pool local de comentarios fingidos (posts de X). Cada ítem cumple `ComentarioAnalizado`. No hay llamadas a xAI. Persona B consume ese JSON.

Approach: Node.js ESM, `http` de stdlib, archivos en `server/` + `mock/` + contrato en `shared/types.js`.

## Technical Context

**Language/Version**: Node.js 20+ (ESM, `"type": "module"`)

**Primary Dependencies**: Node stdlib only (`http`, `fs`, `path`, `url`)

**Storage**: local file `mock/comentarios.json` (no database)

**Testing**: manual via `GET http://localhost:3000/api/comentarios` (no test framework in this slice)

**Target Platform**: local Windows/macOS/Linux, `http://localhost:3000`

**Project Type**: small HTTP service + static `public/` (Persona B; out of A’s edit scope)

**Performance Goals**: each GET < 2s locally (SC-003)

**Constraints**: no outbound `api.x.ai`; A does not edit `public/`; `shared/` only by agreement

**Scale/Scope**: one endpoint, tens of mock comments, two-person hackathon

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec-first: plan traces to spec 001 + clarifications C-001–C-005. PASS
- File ownership: this plan only authorizes `server/`, `mock/`, and read of `shared/types.js`. PASS
- Frozen contract: `ComentarioAnalizado` fields unchanged. PASS
- Mock-first: default path is mock; xAI stub MUST NOT be default. PASS
- Traceability: each source file below maps to FR-001–FR-007. PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-persona-a-mock-comentarios/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── get-api-comentarios.md
└── tasks.md
```

### Source Code (repository root)

```text
shared/
└── types.js              # ComentarioAnalizado + isComentarioAnalizado (contract)
mock/
└── comentarios.json      # pool of fake X posts
server/
├── index.js              # HTTP server, GET /api/comentarios, static public/
├── provider.js           # MUST dispatch to mock by default
├── mock.js               # read pool, filter invalid items, return envelope
└── xai.js                # stub only; MUST NOT run on the default path
```

**Structure Decision**: keep the existing Vox tree. Do not invent `src/` or a framework.

## Complexity Tracking

> No constitution violations. Table left empty on purpose.
