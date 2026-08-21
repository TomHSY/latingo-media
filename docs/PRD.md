# Product Requirements — Media Templates

## Format dimensions

| Format | Size | Use |
|--------|------|-----|
| Carousel | 1080×1350 (4:5) | Weekly digest |
| Story | 1080×1920 (9:16) | Ce soir, cancellation alerts |
| Square | 1080×1080 (1:1) | Facebook |

## Instagram rules

Instagram is a **teaser**, not the product. See [strategy/CONTEXT.md](strategy/CONTEXT.md) for full scarcity rules.

1. Carousel shows 4 of N events; closing slide says "+X autres sur l'app"
2. Show image + title + city + dance type only — no address, ticket link, or full description
3. **Carousels:** never include cancelled events
4. **Stories:** cancelled events appear with "ANNULÉE" mark so users are informed
5. **Stories links:** the current Graph API flow is image-only; clickable link stickers are deferred until official API support

## Content calendar

All times **Europe/Paris**.

| Schedule | Format | Content |
|----------|--------|---------|
| Tuesday 14:00 | Carousel (4:5) | "Où danser ce week-end?" — 4 selected events |
| Daily 12:00 | Story (×N) | One story per event happening that day |

Weekly carousel selection prioritizes spicy picks with dance diversity and city freshness. Likely recurring events are down-ranked (not hard-excluded) until recurring metadata is exposed by the API.

Automated via GitHub Actions — see [DEPLOYMENT.md](DEPLOYMENT.md).

## Templates

### Template 1: Weekly digest carousel — SHIPPED

- **Slide 1 — Cover:** "Où danser ce week-end?" + date range + count
- **Slides 2–5 — Events:** Event image + date/time badge + title + city + dance type pills
- **Slide 6 — Closing:** "+X autres soirées sur l'app" + CTA + app store badges

Implementation: `src/templates/weekly-digest/`

### Template 2: Ce Soir story — SHIPPED

Single event highlight for tonight. Full-bleed image + gradient overlay. Title + city + time + dance types.

When `status === 'cancelled'`: "ANNULÉE" badge, dimmed backdrop, optional `cancellation_reason`.

Implementation: `src/templates/ce-soir/EventStory`

### Templates 3–8 — PLANNED

| # | Name | Description |
|---|------|-------------|
| 3 | Dance type spotlight | "3 soirées Bachata ce week-end" |
| 4 | City focus | "Que faire à Bayonne ce week-end?" |
| 5 | Map digest | Pins on map — future |
| 6 | New event alert | "Nouvelle soirée ajoutée 🆕" |
| 7 | Weekly stats | "Cette semaine sur LatinGo" — optional |
| 8 | Seasonal/thematic | Manual trigger (été, festivals, **rentrée** September restart) |
| 9 | Cross-border | **"L'autre côté de la frontière"** — FR vs ES weekend event counts; wedge differentiator |

### Pending / gaps (not templates)

| Item | Status | Notes |
|------|--------|-------|
| **Organizer `@`-tagging** | Planned | Caption append from latingo-app playbook `ig_handle` or future API; not in `caption.ts` yet |
| **Reels / video** | Gap | No video pipeline; IRL footage published manually |
| **Facebook Page** | Code shipped | Enable when `FB_PAGE_ACCESS_TOKEN` + `FB_PAGE_ID` set — see DEPLOYMENT.md |

### Future: Soirée annulée story

Dedicated story when a previously featured event gets cancelled. Aligns with LatinGo trust positioning. See [strategy/ROADMAP.md](strategy/ROADMAP.md).
