# Landing Page

Public marketing site for LatinGo. Converts local SBK dancers into app downloads on **Android and iOS**, builds trust with live event data, and recruits organizers. Lives in `landing/` — separate from the media engine (`src/`).

## Purpose

Single-page funnel: explain the problem, show features, prove local coverage, display live event previews, drive Play Store + App Store installs, recruit organizers. Deployed at **www.latingo.fr**.

Brand voice aligns with [strategy/CONTEXT.md](strategy/CONTEXT.md). Instagram carousel CTAs link to app stores or this site.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS 3 (custom dark theme tokens)
- French copy throughout
- DM Sans (Google Fonts)

## Page structure

`landing/src/App.tsx` composes:

```
Navbar → Hero → Problem → Features → LocalProof → EventsPreview → Screenshots → Organizers → FAQ → Footer
```

| Component | Anchor | Notes |
|-----------|--------|-------|
| `Hero.tsx` | `#telecharger` | Headline, hook, `StoreButtons` |
| `Problem.tsx` | — | WhatsApp / FB / IG overload |
| `Features.tsx` | — | Filters, map, Radar |
| `LocalProof.tsx` | — | Cities, venues, “100+ danseurs”, API stats |
| `EventsPreview.tsx` | — | Up to 4 cards + store CTAs |
| `Screenshots.tsx` | — | 5-slide phone carousel |
| `Organizers.tsx` | `#organisateurs` | Organizer recruitment |
| `FAQ.tsx` | `#faq` | Accordion |
| `Footer.tsx` | — | Social, email, store links |

Shared UI: `StoreButtons.tsx` (Play + App Store badges), `SceneBackground.tsx` (section backgrounds).

**Removed (Aug 2026 overhaul):** `Download.tsx`, `IOSWaitlist.tsx`, Formspree iOS waitlist.

**Legacy (unused in `App.tsx`):** `Banner.tsx`, `Showcase.tsx`, `Trust.tsx`, `HowItWorks.tsx` — safe to delete when cleaning up.

## Store links

Defined in `landing/src/constants.ts`:

| Link | URL |
|------|-----|
| Google Play | `https://play.google.com/store/apps/details?id=fr.latingo.app` |
| App Store | `https://apps.apple.com/app/id6783507682` |
| Instagram | `https://www.instagram.com/latingo.fr/` |
| Facebook | `https://www.facebook.com/profile.php?id=61590203503679` |
| Contact | `contact@latingo.fr` |

## Dynamic event data

Event stats and preview cards are fetched from `api.latingo.fr` at build time:

- Script: `landing/scripts/fetch-events.ts`
- Output: `landing/src/data/events.json` (committed; refreshed on deploy)
- Fallback: `landing/src/data/events.fallback.json` if fetch fails locally
- Runtime filter: `landing/src/data/index.ts` picks up to 4 preview events (this week first, then any future)

**Stats window:** next 30 days, non-cancelled events. Venue count deduped by coordinates or city.

**Refresh schedule:**

- Every push to `main` (via `deploy-landing.yml`)
- Daily at 8am Paris (via `refresh-landing.yml`)

Requires GitHub secrets: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (same service account as media engine).

## Commands

Run from `landing/`:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local dev server |
| `npm run fetch-events` | Refresh `events.json` from API |
| `npm run build` | Fetch events + production build → `landing/dist/` |
| `npm run build:site` | Build only (skip fetch) |
| `npm run preview` | Preview production build |

Root `package.json` scripts do **not** cover the landing site.

## Deploy

GitHub Actions workflows:

- `.github/workflows/deploy-landing.yml` — push to `main`
- `.github/workflows/refresh-landing.yml` — daily cron + manual trigger

Both fetch events, build `landing/`, deploy `landing/dist/` to GitHub Pages. Custom domain: `landing/public/CNAME` → `www.latingo.fr`.

## Analytics

CTA elements expose `data-event` attributes (store badges, navbar, FAQ, organizer contact, social). No analytics script is loaded in `index.html` yet.

## Design tokens

Tailwind config in `landing/tailwind.config.js`:

| Token | Hex |
|-------|-----|
| background | `#0F0F14` |
| surface | `#1C1C24` |
| coral | `#FF4E3A` |
| gold | `#FFB830` |
| primary-text | `#F5F0EA` |
| secondary-text | `#9B97A3` |

Similar palette to media engine Noche theme but independently configured.

## Assets

Images in `landing/public/images/`. App screenshots sourced from repo `pictures/Screenshot_*.jpg`. Section backgrounds include `hero-dance.png`, `dance-club-crowd.png`, `dance-social-neon.png`, `dance-coastal-sunset.png`.

## Relationship to media engine

| | Media engine (`src/`) | Landing (`landing/`) |
|--|----------------------|---------------------|
| Build | Root `package.json` | `landing/package.json` |
| Output | PNG files in `output/` | Static HTML in `landing/dist/` |
| API | Reads api.latingo.fr | Build-time events fetch only |
| Deploy | Manual / GitHub Actions | GitHub Pages auto |

## Strategy reference

Marketing positioning and copy principles: [../site_context.md](../site_context.md).
