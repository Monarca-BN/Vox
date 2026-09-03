# Research: 001-persona-a-mock-comentarios

## Decision 1 — Node stdlib HTTP, no framework

**Decision**: `node:http` in `server/index.js`.

**Rationale**: hackathon, zero deps in package.json, Persona B only needs GET + static files.

**Alternatives rejected**: Express/Fastify (extra surface, not in spec).

## Decision 2 — JSON file as mock source

**Decision**: `mock/comentarios.json` is the pool of fake X posts.

**Rationale**: editable by Persona A without a DB; easy to demo.

**Alternatives rejected**: hard-coded array in JS (harder for B to see the data); SQLite (out of scope).

## Decision 3 — Filter, don’t coerce, invalid items

**Decision**: drop items that fail `isComentarioAnalizado`; never return half-valid objects.

**Rationale**: spec edge case + FR-003 / SC-002.

## Decision 4 — xAI stub stays dark

**Decision**: if `server/xai.js` exists, `provider.js` MUST default to mock. No `XAI_API_KEY` required.

**Rationale**: constitution IV + FR-004 + C-005.

## Decision 5 — Envelope 200 + optional error

**Decision**: always JSON `{ comentarios, updatedAt, error? }` with HTTP 200 on this endpoint’s read path.

**Rationale**: C-002 so Persona B can poll without special-casing 5xx.
