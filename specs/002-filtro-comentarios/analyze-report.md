# Analyze report: 002-filtro-comentarios

**Date**: 2026-09-04
**Against**: `main` @ `25147a6` (PR #3 merged) + live `GET http://localhost:3000/api/comentarios`
**Scope**: Persona A `server/`, `mock/`, `shared/`. `public/` reviewed only as a consumer of the query contract (constitution II demo exception).

## Functional requirements

| ID | Verdict | Evidence |
| --- | --- | --- |
| FR-001 | PASS | `server/index.js` still serves `GET /api/comentarios`. After `getComentarios()` it runs `applyComentarioFilters(envelope.comentarios, url.searchParams)` in `server/filters.js`. |
| FR-002 | PASS | Live filtered and unfiltered GETs → HTTP 200 JSON `{ comentarios, updatedAt }`. No `page` / `cursor` / `next` / `total`. Catch path still 200 + `error?`. |
| FR-003 | PASS | `server/mock.js` drops invalid pool rows with `isComentarioAnalizado` before drip. Filters run on that validated current list. Live: 100% of items (unfiltered n=25 after drip) passed the contract. |
| FR-004 | PASS | Live `?severity=high` → 9 items, all `severity: "high"` (0.3–1.1 ms). `?severity=HIGH` same rule (trim + lower). `?severity=nope` and `?severity=critical` and blank `?severity=` → HTTP 200 `{ comentarios: [] }`. |
| FR-005 | PASS | Live `?es_bug=true` → 16 items, all `true`. `?es_bug=false` → 9 items, all `false`. `?es_bug=yes` → `[]` (not coerced). |
| FR-006 | PASS | Live `?feature=Latencia` → 1 item, `feature: "latencia"` (trim + case-insensitive exact). Whitespace-only `?feature=%20%20` ignored (same count as unfiltered current list after drip exhausted). |
| FR-007 | PASS | Live `?foo=bar` and `?page=2&cursor=abc` ignored. After the mock pool was fully dripped, `?foo=bar` matched the unfiltered current list (25/25 same `texto`). Known keys still AND. |
| FR-008 | PASS | `server/provider.js` `useMock = process.env.USE_MOCK !== "0"`. `USE_MOCK` unset. `XAI_API_KEY` unset. No Linear/Supabase modules. Filter is in-process on the mock list. |
| FR-009 | PASS | Live headers: `Access-Control-Allow-Origin: *`. OPTIONS 204 with `Allow-Methods: GET, POST, OPTIONS` and `Allow-Headers: Content-Type`. |
| FR-010 | PASS | `ComentarioAnalizado` required fields in `shared/types.js` unchanged. `TicketFingido` typedef is additive (spec 003). Persona A files: `server/filters.js`, `server/index.js` query wiring. `mock/` untouched. |

## Clarifications

| ID | Verdict | Evidence |
| --- | --- | --- |
| C-001 | PASS | Filters AND. Omit a key → that field unconstrained. Combo `?severity=high&es_bug=true&feature=latencia` → exactly the intersection (1 item: latencia / high / bug), not a union. |
| C-002 | PASS | Unknown keys ignored, never 400. `?foo=bar` HTTP 200 + current list. |
| C-003 | PASS | Invalid `severity` / `es_bug` → HTTP 200 + `comentarios: []`. Documented empty list is OK. |
| C-004 | PASS | Feature compare is `trim().toLowerCase()` equality in `server/filters.js`, not substring/glob. |
| C-005 | PASS | Empty / whitespace `feature` skipped (`if (feat !== "")`). |
| C-006 | PASS | `page` / `cursor` do not paginate; full filtered (or current) list returned. |
| C-007 | PASS | Envelope `{ comentarios, updatedAt }` on every 200 read, including invalid filters. |
| C-008 | PASS | Filter applied after mock validation. Helper never rehydrates raw JSON rows. |
| C-009 | PASS | Implementation is `server/filters.js` + `server/index.js`. |

## Tasks

| ID | Verdict | Notes |
| --- | --- | --- |
| T001 | DONE | `server/index.js`, `server/mock.js`, `server/provider.js`, `shared/types.js` present. |
| T002 | DONE | `server/filters.js` exports `applyComentarioFilters(comentarios, searchParams)`. |
| T003 | DONE | Severity / es_bug / feature rules match C-001–C-005 and FR-004–FR-007. |
| T004 | DONE | Unknown keys ignored; invalid severity/es_bug → `[]`; blank feature ignored. Live-confirmed. |
| T005 | DONE | `server/index.js` passes `url.searchParams` through the helper after `getComentarios()`. |
| T006 | DONE | HTTP 200 envelope preserved (`{ ...envelope, comentarios }`). |
| T007 | DONE | No pagination; filtered current list returned in full. |
| T008 | DONE | Invalid severity/es_bug → 200 + `[]`. |
| T009 | DONE | Unknown keys do not 400. |
| T010 | DONE | CORS `*` unchanged. |
| T011 | DONE | Live `POST /api/comentarios` → 405 `{ error: "method not allowed" }`. |
| T012 | DONE | Unfiltered GET still spec 001 (mock drip + envelope). |
| T013 | DONE | Provider still defaults to mock. |
| T014 | DONE | Quickstart curls re-run locally; all < 2s (unfiltered 23.6 ms first, later 0.3–1.1 ms). |

## Live probe (T014 / SC-001–SC-005)

Process: `node server/index.js` on `:3000`. Mock may drip; numbers below are after the pool was exhausted (25 validated items) unless noted.

| Call | Status | Result |
| --- | --- | --- |
| `GET /api/comentarios` | 200 | `{ comentarios, updatedAt }`, CORS `*`, 23.6 ms (first; 3 dripped) then grows to 25 |
| `GET /api/comentarios?severity=high` | 200 | 9 items, all `high`, 1.1 ms |
| `GET /api/comentarios?es_bug=true` | 200 | 16 items, all `true` |
| `GET /api/comentarios?severity=nope` | 200 | `{ comentarios: [], updatedAt }` |
| `GET /api/comentarios?foo=bar` | 200 | same 25 `texto` as unfiltered (unknown ignored) |
| `GET ?severity=high&es_bug=true&feature=latencia` | 200 | 1 item, exact AND |
| `POST /api/comentarios` | 405 | not treated as success |

`XAI_API_KEY` unset. No outbound xAI / Linear / Supabase.

## Residual notes (not gaps)

- Drip from spec 001 still applies: the first GET is a subset of the pool. Filters apply to the *current* validated list, so `?severity=high` on a cold process can be a short list until more items drip. After exhaustion, counts match the pool (9 high / 16 bug / 9 non-bug).
- Sequential `?foo=bar` vs unfiltered can differ *while drip is still adding items*. Same process state (pool exhausted) matches 1:1. Not a pagination or unknown-key bug.
- `shared/types.js` gained a non-breaking `TicketFingido` typedef for spec 003. `ComentarioAnalizado` shape was not changed.

## Overall

**Converged.** FR-001–FR-010, C-001–C-009, and T001–T014 are satisfied by live Persona A code on `main`. No `server/` or `mock/` edits required. Task checkboxes already `[x]`; left as-is.
