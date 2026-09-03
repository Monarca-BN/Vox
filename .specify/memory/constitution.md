<!--
  Sync Impact Report
  Version change: (none) → 1.0.0
  Modified principles: n/a (initial ratification)
  Added sections: Core Principles, Ownership & Scope, Governance
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

### V. Traceability
Every change in `server/` or `mock/` MUST map to a requirement or
acceptance scenario in the Persona A spec. If a change is not in the spec,
say so explicitly and amend the spec before merging it.

## Ownership & Scope

- In scope for Persona A (this slice): mock pool of fake X comments and
  `GET /api/comentarios` returning `ComentarioAnalizado` items.
- In scope for Persona B: PWA UI consuming that endpoint. Out of this
  constitution's implementation authority.
- Out of scope for the project: Linear, Slack, persistent database,
  real X/xAI ingestion.

## Governance

This constitution supersedes informal chat agreements.
Amendments MUST: (1) update this file, (2) bump the version
(MAJOR = incompatible principle change, MINOR = new principle/section,
PATCH = clarification), (3) update affected specs, (4) then code.
Reviews MUST reject PRs that add behavior not traced to a spec.

**Version**: 1.0.0 | **Ratified**: 2026-09-03 | **Last Amended**: 2026-09-03
