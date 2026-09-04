# Analyze report: 003-tickets-fingidos

**Date**: 2026-09-04
**Against**: `main` @ `25147a6` (PR #3 merged) + live `http://localhost:3000/api/tickets`
**Scope**: Persona A `server/` (+ non-breaking `shared/types.js` typedef). Minimal `public/` reviewed under constitution II demo exception.

## Functional requirements

| ID | Verdict | Evidence |
| --- | --- | --- |
| FR-001 | PASS | `POST /api/tickets` in `server/index.js`. `comentarioFromBody()` accepts raw `ComentarioAnalizado` or `{ comentario }` via `isComentarioAnalizado`. |
| FR-002 | PASS | Live valid POST → HTTP 201 ticket JSON. Stored in `server/tickets.js` in-memory array. |
| FR-003 | PASS | Live ticket keys: `id`, `titulo`, `estado`, `severity`, `feature`, `es_bug`, `resumen`, `textoOrigen`, `createdAt`. Matches data-model / typedef. |
| FR-004 | PASS | Create returned `estado: "abierto"`. Close sets `"hecho"`. `TICKET_ESTADOS` in `shared/types.js` is `abierto` \| `hecho`. |
| FR-005 | PASS | Live ids `T-1` then `T-2` (increment). Distinct across two POSTs in one process. |
| FR-006 | PASS | `deriveTitulo()` uses trimmed `resumen`; fallback `texto` slice ~80. Live titulo = `"Timeout o hang en respuestas largas en mobile."` from resumen. |
| FR-007 | PASS | Live `GET /api/tickets` → HTTP 200 `{ tickets, updatedAt }`. Cold process: `tickets: []` + ISO `updatedAt`. |
| FR-008 | PASS | Live `POST {}` → 400 `{ "error": "body must be ComentarioAnalizado or { comentario }" }`. `POST not-json` → 400 `{ "error": "invalid json" }`. GET count unchanged (2 → 2). |
| FR-009 | PASS | Same CORS as comments: `Access-Control-Allow-Origin: *`. OPTIONS `/api/tickets` → 204, methods `GET, POST, OPTIONS`, headers `Content-Type`. |
| FR-010 | PASS | `server/tickets.js` is a module singleton (`let tickets = []`). No file write, no Linear/Supabase client. `server/xai.js` not on the ticket path. Restart on `:3011`: POST created `T-1`, new process GET → `tickets: []`. |
| FR-011 | PASS | Live `POST /api/tickets/T-1/cerrar` → 200, `estado: "hecho"`. `POST /api/tickets/T-999/cerrar` → 404 `{ "error": "ticket not found" }`. |

## Clarifications

| ID | Verdict | Evidence |
| --- | --- | --- |
| C-001 | PASS | No Linear token, issue URL, or tracker HTTP. Ticket is a plain object. |
| C-002 | PASS | In-memory only. Restart empties the list (live `:3011`). |
| C-003 | PASS | Raw body → 201 `T-1`. Wrapper `{ comentario }` → 201 `T-2`. |
| C-004 | PASS | Invalid → 400 `{ error }`. Missing close id → 404 `{ error }`. |
| C-005 | PASS | Close is `POST /api/tickets/:id/cerrar` only. No PATCH route. |
| C-006 | PASS | OPTIONS allows GET and POST. `send()` attaches CORS on JSON responses. |
| C-007 | PASS | Id scheme `T-` + increment from 1 per process. |
| C-008 | PASS | Titulo from resumen trim; texto fallback present in `deriveTitulo`. |

## Tasks

| ID | Verdict | Notes |
| --- | --- | --- |
| T001 | DONE | `server/tickets.js` empty list + `T-` ids. |
| T002 | DONE | Exports `createTicket`, `listTickets`, `cerrarTicket`. |
| T003 | DONE | Titulo from resumen / ~80 chars of texto. |
| T004 | DONE | Create → `abierto` + ISO `createdAt`. |
| T005 | DONE | CORS OPTIONS methods + `Content-Type` header. |
| T006 | DONE | Stdlib `readJsonBody` (1 MB cap). |
| T007 | DONE | Both body shapes accepted. |
| T008 | DONE | POST → 201 + ticket. |
| T009 | DONE | GET → 200 `{ tickets, updatedAt }`. |
| T010 | DONE | No disk persistence; restart resets. |
| T011 | DONE | Invalid object → 400 `{ error }`. |
| T012 | DONE | Invalid JSON → 400 `{ error }`. |
| T013 | DONE | GET count unchanged after 400s. |
| T014 | DONE | Close → 200 `hecho`. |
| T015 | DONE | Unknown id → 404. |
| T016 | DONE | `public/index.html` + `app.js`: severity / es_bug / feature controls call `GET /api/comentarios?…`. |
| T017 | DONE | Each card has **Crear ticket** → `POST /api/tickets` with that comentario. |
| T018 | DONE | Tickets section lists `GET /api/tickets`; **Cerrar** → `/cerrar`. |
| T019 | DONE | PR #3 already noted the constitution II `public/` exception; this analyze PR restates it. |
| T020 | DONE | Tickets path does not call xAI; mock remains default. |
| T021 | DONE | Quickstart API re-run (create/list/400/cerrar/restart). Demo UI present at `/`. |
| T022 | DONE | `package.json` still has no dependencies. |

## Live probe (T021 / SC-001–SC-004)

`node server/index.js` on `:3000` unless noted. Each call < 2s.

| Call | Status | Result |
| --- | --- | --- |
| `GET /api/tickets` (cold) | 200 | `{ tickets: [], updatedAt }` (0.6 ms) |
| `POST /api/tickets` valid `ComentarioAnalizado` | 201 | `T-1`, `estado: "abierto"`, titulo from resumen (1.0 ms) |
| `POST /api/tickets` `{ comentario }` | 201 | `T-2` |
| `GET /api/tickets` | 200 | 2 tickets, ids `T-1`, `T-2` |
| `POST /api/tickets` `{}` | 400 | `{ error }` |
| `POST /api/tickets` non-JSON | 400 | `{ error: "invalid json" }` |
| `GET /api/tickets` after 400s | 200 | still 2 tickets |
| `POST /api/tickets/T-1/cerrar` | 200 | `estado: "hecho"` |
| `POST /api/tickets/T-999/cerrar` | 404 | `{ error: "ticket not found" }` |
| OPTIONS `/api/tickets` | 204 | CORS `*`, methods GET/POST/OPTIONS |
| New process `:3011` after create+kill | 200 | `tickets: []` |

No `XAI_API_KEY`. No Linear / Supabase env. `find` shows no tickets data file under the repo.

## Residual notes (not gaps)

- `deriveTitulo` also slices a long `resumen` to 80 chars. Current mock resumen values are shorter than 80; C-008 only requires fallback slice on `texto`. Not a blocking mismatch.
- Duplicate POSTs of the same comment create two tickets (allowed; no dedup required).
- Closing an already-`hecho` ticket returns 200 with `hecho` again (contract: “idempotent-enough”).
- Demo `public/` edits are the documented constitution II exception (Juan). Not a file-ownership gap.

## Overall

**Converged.** FR-001–FR-011, C-001–C-008, and T001–T022 are satisfied by live code on `main`. No Persona A `server/` or `mock/` edits required. Task checkboxes already `[x]`; left as-is.
