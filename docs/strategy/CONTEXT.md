# Strategic Context

**GTM source of truth:** latingo-app `docs/strategy/` (CONTEXT, ROADMAP, IDEAS, DECISIONS). This file covers content-production positioning only.

## Core insight

LatinGo's event database **is** the content. The bottleneck isn't copywriting — it's **visual production at scale** and **smart communication** on social platforms where other dance event aggregators already exist.

## Competitive positioning

- **LatinGo strengths:** neutral aggregator (not a promoter), exhaustive local coverage, structured data, trustworthy/useful
- **Differentiator:** We don't promote our own events. We're the "TV guide" of local SBK — curated, reliable, easy
- **Cross-border edge:** ~55% of wedge events are in Spanish Basque Country — content can highlight *"l'autre côté de la frontière"* (FR vs ES weekend counts). No local WhatsApp gatherer aggregates both sides.
- **Avoid:** competing with individual event organizers on hype/engagement

## Brand voice

- Useful, neutral, modern, local, concise, community-oriented
- NOT: startup jargon, influencer-style, hype marketing, aggressive growth

## Copy rules (Aug 2026)

- **Lead with completeness** — "500+ soirées listées", "toute la scène SBK du Pays Basque" — not user/install counts until scale justifies it (latingo-app DECISIONS 2026-08-21).
- **One idea per post** — each asset has one job (see 5-pillar framework below).

## 5-pillar editorial framework

From latingo-app strategy session 2026-08-21. Rotate ~3 feed posts/week + stories.

| Pillar | Job | This engine |
|--------|-----|-------------|
| **1. Ce week-end** | Prove completeness | **Automated** — Tue carousel, daily CE SOIR stories |
| **2. Ancrage local / FOMO** | Locality + hero event | Partial — spicy selection, CE SOIR; organizer/venue tags pending |
| **3. Produit** | Teach app features | Manual reels — not this repo |
| **4. Fondateur** | Trust, community | Manual — founder |
| **5. Organisateurs** | Co-marketing, Phase 2 seed | Planned — `@` tags from playbook `ig_handle` |

## Instagram = billboard / teaser

Instagram is NOT the product. The app is. Instagram serves as:

- A **billboard** to signal LatinGo exists
- A **teaser** that shows SOME events, never ALL
- A **trust builder** proving the app has real, curated content
- A **funnel** → "See all events in the app"

## Scarcity rules (critical)

1. **Never show all events** — carousel shows 4 out of N, closing slide says "+X autres on the app"
2. **Never show full details** — image + title + city + dance type. NO address, NO ticket link, NO full description
3. **Always create curiosity gap** — "Découvre toutes les soirées sur l'app"
4. **Rotate events** — don't always show the same top 4 (vary selection)
5. **Carousels exclude cancelled events** — filter before selection (see [API.md](../API.md))
6. **Stories inform about cancellations** — cancelled events appear with "ANNULÉE" mark

## Content calendar (Instagram)

All times **Europe/Paris**. Locked Aug 2026 — see [DECISIONS.md](DECISIONS.md).

**Principle:** Instagram is a teaser/billboard (~3 feed posts/week + daily stories). The app is where dancers find the full agenda. Empty feed days are intentional. Do not run a daily “new event added” stream on IG (that belongs in-app).

### Always-on (automated)

| Schedule | Format | Content | Status |
|----------|--------|---------|--------|
| Daily 17:00 (12:00 Sat–Sun) | Story (×N) | One CE SOIR story per event that day (0 if none) | Automated — [DEPLOYMENT.md](../DEPLOYMENT.md) |
| As needed | Story | ANNULÉE when that day has cancelled events | Spec’d; optional with daily batch |

### Feed (~3 posts/week)

| Day | Format | Content | Who |
|-----|--------|---------|-----|
| **Mon** | — | No feed post | — |
| **Tue 18:00** | Carousel (4:5) | "Où danser ce week-end?" — 4 of N | Automated |
| **Wed** | Feed / Reel | App functionality, guide, or demo **or** founder thoughts (rotate; skip if thin) | Manual |
| **Thu** | Feed (lens) | Dance / area / stats rotation — see below | Engine renders Wed; **founder approves Thu before publish** |
| **Fri–Sun** | — | No fixed feed post; stories carry the weekend | Optional one-off Reel only if strong IRL/product clip |

### Thursday lens rotation

Repeat this 8-week cycle (one lens per Thursday):

1. Dance type spotlight  
2. Area focus  
3. Dance type spotlight  
4. Weekly stats  
5. Area focus  
6. Dance type spotlight  
7. Area focus  
8. Weekly stats  
→ then back to dance…

`dance → area → dance → stats → area → dance → area → stats → …`

**Event window:** Thu–Sun only (Europe/Paris), not the full ISO week. Hard-exclude Tuesday carousel event IDs.

**Areas (not cities):** BAB · Landes · Béarn · Euskadi — see [THURSDAY-LENS.md](THURSDAY-LENS.md).

**Slot variants** (when data supports them):

| Slot type | Default | Variant |
|-----------|---------|---------|
| Dance | Salsa / Bachata / Kizomba spotlight | **Autres danses** (Zouk, Semba, WCS, Tango bundled) |
| Area | Area focus post | **Cross-border** FR vs ES |
| Stats | Weekly numbers | **Salsa vs Bachata duel** |

**Pre-publish review (required):** Wednesday ~20:00 Paris — engine renders preview PNGs to R2 (`DRY_RUN=true`). Founder reviews URLs in GitHub Actions summary. Thursday — founder triggers manual publish via Actions (`job=thursday`). **No autonomous Thursday publish.**

**Scarcity:** do not reuse the same events on Tuesday’s carousel and Thursday’s lens the same week. Seasonal / thematic posts replace a feed slot when the calendar warrants (rentrée, festivals) — they are not a fixed Monday.

## Instagram account setup

- **Handle:** @latingo.app (or @latingo_fr)
- **Bio:** "Toutes les soirées SBK près de chez toi 💃🕺\n📍 Pays Basque · Landes · Béarn\n👇 Télécharge l'app"
- **Link in bio:** App store link (or Linktree with app + website)
- **Highlights:** "Salsa", "Bachata", "Kizomba", "App", "À propos"
- **Profile type:** Business/Creator for Meta API access later

## Landing page

Marketing funnel at [www.latingo.fr](https://www.latingo.fr) — see [LANDING.md](../LANDING.md) and [site_context.md](../../site_context.md). Same brand voice; converts dancers to **Play Store + App Store downloads** with live event previews and a secondary organizer recruitment block. iOS waitlist (Formspree) removed Aug 2026 — both mobile platforms are live.
