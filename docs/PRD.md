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

All times **Europe/Paris**. Full editorial rules: [strategy/CONTEXT.md](strategy/CONTEXT.md). Locked decision: [strategy/DECISIONS.md](strategy/DECISIONS.md).

| Schedule | Format | Content |
|----------|--------|---------|
| Daily 12:00 | Story (×N) | CE SOIR — one story per event that day; ANNULÉE when relevant |
| Tuesday 14:00 | Carousel (4:5) | "Où danser ce week-end?" — 4 selected events |
| Wednesday | Feed / Reel | App guide/demo **or** founder thoughts (manual; skip if thin) |
| Thursday | Feed (lens) | Dance → area → dance → stats → … — engine renders Wed; **founder approves before publish** |
| Mon, Fri–Sun | — | No fixed feed post |

Weekly carousel selection prioritizes spicy picks with dance diversity and city freshness. Likely recurring events are down-ranked (not hard-excluded) until recurring metadata is exposed by the API. Do not reuse Tuesday carousel events on the same week’s Thursday lens.

Automated today via GitHub Actions: daily stories + Tue carousel — see [DEPLOYMENT.md](DEPLOYMENT.md). Wed feed is manual. Thu lens: preview automated Wed; **publish requires founder review** — see [strategy/THURSDAY-LENS.md](strategy/THURSDAY-LENS.md).

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

### Templates 3–9 — Phase 4 (Thursday lens)

| # | Name | Description |
|---|------|-------------|
| 3 | Dance type spotlight | "3 soirées Bachata ce week-end" — SBK tier prioritization; **autres danses** variant when rare dances ≥ 3 combined |
| 4 | Area focus | "Que faire en BAB ce week-end?" — four areas: BAB, Landes, Béarn, Euskadi (not single city) |
| 5 | Map digest | Pins on map — future |
| 6 | New event alert | "Nouvelle soirée ajoutée 🆕" — rare IG teaser only |
| 7 | Weekly stats | "Cette semaine sur LatinGo" — **Salsa vs Bachata duel** variant when both ≥ 5 |
| 8 | Seasonal/thematic | Manual trigger (été, festivals, **rentrée** September restart) |
| 9 | Cross-border | **"L'autre côté de la frontière"** — FR vs ES counts; **area-slot variant** (not extra day) |

**Thursday window:** Thu–Sun events only. Exclude Tue carousel IDs. Show 3 events + closing "+X autres". Full spec: [strategy/THURSDAY-LENS.md](strategy/THURSDAY-LENS.md).

Implementation: `src/templates/dance-spotlight/`, `area-focus/`, `weekly-stats/`, `cross-border/`

### Pending / gaps (not templates)

| Item | Status | Notes |
|------|--------|-------|
| **Organizer `@`-tagging** | Planned | Caption append from latingo-app playbook `ig_handle` or future API; not in `caption.ts` yet |
| **Reels / video** | Gap | No video pipeline; IRL footage published manually |
| **Facebook Page** | Code shipped | Enable when `FB_PAGE_ACCESS_TOKEN` + `FB_PAGE_ID` set — see DEPLOYMENT.md |

### Future: Soirée annulée story

Dedicated story when a previously featured event gets cancelled. Aligns with LatinGo trust positioning. See [strategy/ROADMAP.md](strategy/ROADMAP.md).
