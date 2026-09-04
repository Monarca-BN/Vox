# Amendment (UI): el feed es lo que llega

**Spec**: [spec.md](./spec.md) — 003-tickets-fingidos  
**Date**: 2026-09-04  
**Status**: Product decision (Juan)

## Decision

The demo UI no longer exposes manual ticket create.

Tickets are already created and **are what is arriving in the feed**. Feed cards are the work items. There is no promote-from-comment step in the PWA.

## UI

- Remove every **Crear ticket** control and any click handler that `POST /api/tickets` from a card.
- Hide or remove the separate **Tickets fingidos** list (including **Cerrar** and its empty state). That section only existed for manually created tickets and confused the model.
- Keep filters + feed. Code/API copy may stay `comentarios`. UI labels may present the feed as incoming incidencias/tickets so users are not invited to create tickets.

## API (unchanged)

Do not delete `server/tickets.js` or the `/api/tickets` routes unless a later spec says so.

Spec 003 (`POST` / `GET` / `cerrar`) may remain unused by the PWA for a later auto-threshold. Leaving the in-memory store idle is fine.

## Clarifies

- **SC-005** (create from a card + tickets section) no longer applies to `public/`. The visible demo is the filtered feed.
- Constitution II demo exception (“crear ticket, lista de tickets”) is superseded for the PWA by this decision. Persona A still owns the unused ticket API.
