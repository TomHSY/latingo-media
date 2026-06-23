# Landing Page

Early Access marketing site for LatinGo. Converts local SBK dancers into waitlist signups. Lives in `landing/` — separate from the media engine (`src/`).

## Purpose

Single-page funnel: explain the problem, show features, build trust, collect Early Access signups. Deployed at **www.latingo.fr**.

Brand voice aligns with [strategy/CONTEXT.md](strategy/CONTEXT.md). Instagram carousel CTAs may link here or to app stores.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS 3 (custom dark theme tokens)
- French copy throughout
- DM Sans (Google Fonts)

## Page structure

`landing/src/App.tsx` composes:

Navbar → Hero → Problem → Features → LocalProof → HowItWorks → Banner → EarlyAccessForm → Trust → FAQ → Footer

## Commands

Run from `landing/`:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build → `landing/dist/` |
| `npm run preview` | Preview production build |

Root `package.json` scripts do **not** cover the landing site.

## Deploy

GitHub Actions workflow: `.github/workflows/deploy-landing.yml`

- Trigger: push to `main`
- Builds `landing/` with Node 20
- Deploys `landing/dist/` to GitHub Pages
- Custom domain: `landing/public/CNAME` → `www.latingo.fr`

## Early Access form

`EarlyAccessForm.tsx` submits to **Formspree** (`formspree.io`) — no backend in this repo. Fields: prénom, email, device (Android/iPhone), ville (optional).

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

Images in `landing/public/images/`. Source photos originally from repo `pictures/` folder.

## Relationship to media engine

| | Media engine (`src/`) | Landing (`landing/`) |
|--|----------------------|---------------------|
| Build | Root `package.json` | `landing/package.json` |
| Output | PNG files in `output/` | Static HTML in `landing/dist/` |
| API | Reads api.latingo.fr | Formspree only |
| Deploy | Manual / future n8n | GitHub Pages auto |
