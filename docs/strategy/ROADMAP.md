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
- Marketing landing page at www.latingo.fr (Aug 2026 overhaul: both-store CTAs, local proof, live events preview)
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

## Phase 4 — Thursday lens templates

Aligned with Instagram calendar ([CONTEXT.md](CONTEXT.md)): Thursday lens cycle `dance → area → dance → stats → …`. Full spec: [THURSDAY-LENS.md](THURSDAY-LENS.md).

- [x] **Docs** — DECISIONS, CONTEXT, PRD, DEPLOYMENT, THURSDAY-LENS.md
- [x] **`src/config/areas.ts`** — city → BAB / Landes / Béarn / Euskadi
- [x] **`src/utils/thursday-selector.ts`** — Thu–Sun window, SBK tiers, variants, ledger, Tue overlap
- [x] Template 3 — Dance spotlight + **autres danses** bundle variant
- [x] Template 4 — **Area focus** (four areas, replaces city-focus)
- [x] Template 7 — Weekly stats + **Salsa vs Bachata duel** variant
- [x] Template 9 — Cross-border as **area-slot variant**
- [x] **Review workflow** — Wed preview render (DRY_RUN) + manual `workflow_dispatch` publish Thu
- **Rentrée / seasonal** — Template 8; replaces a feed slot when warranted (manual)
- New event alert — Template 6 — **not** a daily IG habit; rare teaser only
- Map digest — Template 5 (future)

**Autonomous publish:** Tue carousel + daily CE SOIR stories only. **Thursday always requires founder template review before publish.**

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
