# Research: 003-tickets-fingidos

## Decision 1 — In-memory array, not a file or Supabase

**Decision**: `let tickets = []` plus a monotonic counter in `server/tickets.js`.

**Rationale**: frozen requirement; process lifetime is enough for the demo; constitution forbids Supabase/Linear for this build.

**Alternatives rejected**: `mock/tickets.json` (implies disk persistence); Supabase table (paid/cloud, out of scope); Linear issue create (explicitly forbidden).

## Decision 2 — Ids `T-{n}`

**Decision**: `T-1`, `T-2`, … increment from 1 per process.

**Rationale**: readable in the UI; C-007 allows increment or uuid. Increment needs no dependency.

**Alternatives rejected**: `crypto.randomUUID()` (fine but noisier in a 5-ticket demo).

## Decision 3 — Accept two body shapes

**Decision**: validate with `isComentarioAnalizado(body)` OR `isComentarioAnalizado(body.comentario)`.

**Rationale**: C-003 / FR-001 so the PWA can POST the card object as-is or wrap it.

## Decision 4 — Title from resumen

**Decision**: `titulo = resumen.trim()` if non-empty (it must be, if the comment passed the contract); else `texto.trim().slice(0, 80)`.

**Rationale**: C-008. Keep a fallback so a future looser caller still gets a title.

## Decision 5 — Close via POST …/cerrar, not PATCH

**Decision**: `POST /api/tickets/:id/cerrar` sets `estado = "hecho"`.

**Rationale**: C-005 says include if small; POST matches the existing method set better than introducing PATCH on the whole API.

## Decision 6 — JSON body via stdlib stream

**Decision**: accumulate `req` data events, `JSON.parse`, cap at ~1MB.

**Rationale**: no Express `body-parser`. Invalid JSON → 400 `{ error }`.

## Decision 7 — Minimal public/ for the demo

**Decision**: Persona A adds filter controls, “Crear ticket” on each card, and a tickets section. Note the constitution exception in the PR.

**Rationale**: Juan asked for an end-to-end mock demo. Spec 002+003 APIs alone are not visible in the PWA.
