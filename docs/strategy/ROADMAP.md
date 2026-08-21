# Roadmap

GTM and marketing strategy source of truth: **latingo-app** `docs/strategy/` (CONTEXT, ROADMAP, IDEAS, DECISIONS). This repo implements content *production* and Meta publishing.

## Shipped (Phase 0–1)

- Strategic decisions locked
- Scaffolding: tokens, components, renderer, preview server
- Visual iteration: logo, TLS, image cropping, layout
- Working render pipeline with real API data
- Weekly digest carousel (Template 1)
- Ce Soir story template (Template 2)
- Template extraction into `src/templates/weekly-digest/` and `src/templates/ce-soir/`
- Publisher scaffold: Instagram Graph, Facebook, R2 upload, Google Drive, captions
- Early Access landing page at www.latingo.fr
- **Instagram auto-publish** — carousel (Tue) + daily CE SOIR stories via GitHub Actions cron

## Phase 2.5 — API hygiene (current)

- [x] Add `status` fields to `MediaEvent` type
- [x] `activeEventsOnly()` / `cancelledEventsOnly()` in API client
- [x] Filter before carousel selection in render scripts
- [x] Mock data includes cancelled event; carousel excludes it
- [x] `docs/` structure + `AGENTS.md`

## 5-pillar editorial framework (from latingo-app strategy, Aug 2026)

| Pillar | This engine | Manual / other |
|--------|-------------|----------------|
| **1. Ce week-end** | **Automated** — weekly carousel + event count on cover | — |
| **2. Ancrage local / FOMO** | **Partial** — CE SOIR stories; hero picks via `selectSpicyEvents()` | Venue-specific spotlight posts; organizer tags (pending) |
| **3. Produit** | — | Screen-record reels (Radar, map, filters) — no video pipeline here |
| **4. Fondateur / communauté** | — | Founder posts, IRL content bank (latingo-app ROADMAP) |
| **5. Organisateurs** | — | Spotlight + `@` tags in captions — **planned** (needs `ig_handle` data) |

## Phase 3 — n8n orchestration (optional)

Cron → API query → render → deliver PNGs to admin/founder. **Note:** GitHub Actions already covers publish cron; n8n is optional if founder wants a visual workflow.

## Phase 4 — More templates

- Dance type spotlight ("3 soirées Bachata ce week-end") — Template 3
- City focus ("Que faire à Bayonne ce week-end?") — Template 4
- **Cross-border — "L'autre côté de la frontière"** — weekend count FR vs ES side; differentiator no local WhatsApp group has
- **Rentrée / seasonal** — September season restart, festivals, vacances — extends Template 8
- New event alert story — Template 6
- Weekly stats (optional) — Template 7
- Map digest — Template 5 (future)

## Phase 5 — Meta publishing (enable + extend)

Instagram Graph publish is **live**. Remaining:

- [ ] **Facebook Page publish** — enable (`src/publisher/facebook.ts`; tokens in DEPLOYMENT.md)
- [ ] **Organizer `@`-tagging in captions** — read `ig_handle` from latingo-app playbook CSV or future API field; wire into `src/publisher/caption.ts`
- [ ] Reliable error alerting (optional — founder monitors Actions today)
- [ ] Map digest template (future)

## Known gaps

- **Reels / video** — no automated pipeline. IRL footage banked manually; publish via Instagram app or separate tooling.
- **Cancelled-event story styling** — documented in PRD; `ce-soir` template may still need ANNULÉE UI (see IMPLEMENTATION-REMAINING.md — partially stale)
- **Story link stickers** — deferred until official Graph API support

## Future ideas

- **Soirée annulée story:** dedicated template when a previously featured event gets cancelled
- Extract duplicated `selectDiverseEvents` into shared util
- Event rotation seed / anti-repeat logic for carousel selection
