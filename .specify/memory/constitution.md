<!--
  Sync Impact Report
  Version change: 1.0.0 → 1.1.0
  Modified principles: IV (clarified mock-only demo), Ownership & Scope
  Added sections: VI. Fake tickets, no paid APIs
  Removed sections: n/a
  Follow-up TODOs: none
-->

# Vox Constitution

## Core Principles

### I. Spec-first (NON-NEGOTIABLE)
The documents under `.specify/` and `specs/` are the source of truth.
Nobody MAY implement behavior that is not in an approved spec.
If spec and code diverge, the spec MUST be updated first, then the code — never the reverse.

### II. File ownership
Persona A MAY edit `server/` and `mock/`.
Persona B MAY edit `public/`.
`shared/` is the A↔B contract; either person MAY edit it only after both agree.
`.specify/` and `specs/` are shared SDD artifacts; they MUST change before the code they authorize.
Persona A MUST NOT edit `public/`. Persona B MUST NOT edit `server/` or `mock/`.

**Demo exception (Juan / Persona A, specs 002+003):** Persona A MAY make
*minimal* `public/` edits so the mock demo works end-to-end (filter controls,
crear ticket, lista de tickets). This does not transfer PWA ownership to A.

### III. Frozen contract
The shared type `ComentarioAnalizado` is the contract between A and B.
Required fields: `texto` (non-empty string), `es_bug` (boolean),
`severity` (`low` | `medium` | `high`), `feature` (non-empty string),
`resumen` (non-empty string).
A breaking change to this contract is forbidden during the hackathon
unless both people agree and the spec is amended first.

### IV. Mock-first for this slice
This version MUST serve simulated X comments from the mock.
Live calls to xAI, `x_search`, or the real X API MUST NOT run.
A stub MAY exist in the repo; it MUST NOT be the default path.

**This build is mock-only:** no paid APIs, no Linear, no Supabase required.
Tickets are faked in process memory. Do not add a database or cloud backend
for this demo.

### V. Traceability
Every change in `server/` or `mock/` MUST map to a requirement or
acceptance scenario in the Persona A spec. If a change is not in the spec,
say so explicitly and amend the spec before merging it.

### VI. Fake tickets, no paid APIs
Actionable follow-up from a comment is a `TicketFingido` stored in memory
for the life of the Node process. It is NOT a Linear issue, NOT a Supabase
row, and MUST NOT call a paid tracker or LLM API.

## Ownership & Scope

- In scope for Persona A: mock pool of fake X comments;
  `GET /api/comentarios` (optional query filters in spec 002);
  in-memory fake tickets and `GET`/`POST /api/tickets` (spec 003).
- In scope for Persona B: PWA UI consuming those endpoints. Out of this
  constitution's implementation authority except the demo exception in II.
- Out of scope for this build: Linear, Slack, Supabase, persistent database,
  real X/xAI ingestion, paid APIs.

## Governance

This constitution supersedes informal chat agreements.
Amendments MUST: (1) update this file, (2) bump the version
(MAJOR = incompatible principle change, MINOR = new principle/section,
PATCH = clarification), (3) update affected specs, (4) then code.
Reviews MUST reject PRs that add behavior not traced to a spec.

**Version**: 1.1.0 | **Ratified**: 2026-09-03 | **Last Amended**: 2026-09-04
