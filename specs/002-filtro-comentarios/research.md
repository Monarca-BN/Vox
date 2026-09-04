# Research: 002-filtro-comentarios

## Decision 1 — Filter in the HTTP layer, not the mock file

**Decision**: `getComentarios()` still returns the current validated list. `server/filters.js` AND-filters that array using `URLSearchParams`.

**Rationale**: drip/cache stays an implementation detail of spec 001; filters compose on “current list after validation”.

**Alternatives rejected**: re-read and filter the whole JSON pool on every filtered GET (would skip drip and change 001 semantics); client-side only filter (violates FR-001).

## Decision 2 — Invalid enum → empty list, not 400

**Decision**: unknown `severity` / `es_bug` tokens yield HTTP 200 `{ comentarios: [] }`.

**Rationale**: frozen requirement + C-003. Persona B already treats 200 + array. 400 would be a new error path.

**Alternatives rejected**: 400 JSON (breaks poll); coerce `critical` → `high` (undocumented).

## Decision 3 — Ignore unknown keys

**Decision**: only `severity`, `es_bug`, `feature` are read. `page`, `foo`, etc. are ignored.

**Rationale**: C-002 / C-006. Spec 001 clients that add junk query stay compatible.

## Decision 4 — Feature equality after trim + lower case

**Decision**: `a.feature.trim().toLowerCase() === query.trim().toLowerCase()`.

**Rationale**: C-004 exact match, case-insensitive. Empty query feature ignored (C-005).

**Alternatives rejected**: substring / includes (too fuzzy for “exact string match”).

## Decision 5 — No new dependencies

**Decision**: `URL` + `URLSearchParams` from stdlib.

**Rationale**: constitution mock-only / no extra surface. package.json stays dep-free.
