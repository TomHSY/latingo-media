# Remaining code changes (Phase 2.5)

> **Stale notice (2026-08-21):** Items 1–3 and 6–7 below are **shipped** — see `docs/strategy/ROADMAP.md` Phase 2.5 checkmarks. This file is kept for the **remaining** gaps only.

Documentation migration is complete. Outstanding TypeScript work:

## Still open

### `src/templates/ce-soir/index.ts` — cancelled event UI

When `event.status === 'cancelled'` (PRD spec):

- Show "ANNULÉE" instead of "CE SOIR"
- Dim backdrop (`brightness(0.2)`, higher overlay opacity)
- Show `cancellation_reason` when present
- Strikethrough on title

### `src/scripts/render-real.ts` — cancelled stories (optional)

After active carousel stories, render one story per cancelled weekend event to `output/real/stories/cancelled-{id}.png`.

### `src/publisher/caption.ts` — organizer `@`-tagging

Append `@handle` from latingo-app playbook CSV `ig_handle` (or future events API field) when featuring an organizer's event. See latingo-app `IDEAS.md` — Organizer @-tagging.

### Facebook Page publish — enable

Code in `src/publisher/facebook.ts` — set secrets per DEPLOYMENT.md.

### Reels

No pipeline — document-only gap. IRL footage published manually.

## Shipped (do not re-implement)

- `MediaEvent.status` + `activeEventsOnly()` / `cancelledEventsOnly()` in API client
- Carousel scripts filter cancelled before selection
- Mock cancelled event for carousel exclusion tests

## 8. `prompt.txt`

Replace with pointer to `AGENTS.md` + `docs/` (low priority).
