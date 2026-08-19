# Roadmap

## Shipped (Phase 0–1)

- Strategic decisions locked
- Scaffolding: tokens, components, renderer, preview server
- Visual iteration: logo, TLS, image cropping, layout
- Working render pipeline with real API data
- Weekly digest carousel (Template 1)
- Ce Soir story template (Template 2)
- Template extraction into `src/templates/weekly-digest/` and `src/templates/ce-soir/`
- Publisher scaffold: Instagram Graph, Facebook, R2 upload, Google Drive, captions
- Marketing landing page at www.latingo.fr (Aug 2026 overhaul: both-store CTAs, local proof, live events preview)

## Phase 2.5 — API hygiene (current)

- [x] Add `status` fields to `MediaEvent` type
- [x] `activeEventsOnly()` / `cancelledEventsOnly()` in API client
- [x] Filter before carousel selection in render scripts
- [x] Mock data includes cancelled event; carousel excludes it
- [x] `docs/` structure + `AGENTS.md`

## Phase 3 — n8n orchestration

Cron → API query → render → deliver PNGs to admin/founder.

## Phase 4 — More templates

- Dance type spotlight ("3 soirées Bachata ce week-end")
- City focus ("Que faire à Bayonne ce week-end?")
- New event alert story
- Weekly stats (optional)
- Seasonal/thematic (manual trigger)

## Phase 5 — Meta API publishing (partial)

Instagram Graph + Facebook publish scripts exist (`publish:real`). Remaining:

- Reliable scheduling / error handling
- Business account + Meta API approval for production auto-post
- Map digest template (future)

## Future ideas

- **Soirée annulée story:** dedicated template when a previously featured event gets cancelled
- Extract duplicated `selectDiverseEvents` into shared util
- Event rotation seed / anti-repeat logic for carousel selection
