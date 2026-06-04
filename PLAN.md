# LatinGo Autonomous Media Engine — Complete Plan & Decisions

## 1. Strategic Positioning

### The Core Insight
LatinGo's event database IS the content. The bottleneck isn't copywriting — it's **visual production at scale** and **smart communication strategy** on social platforms where other dance event aggregators already exist.

### Competitive Positioning
- **LatinGo's strengths**: neutral aggregator (not a promoter), exhaustive local coverage, structured data, trustworthy/useful
- **Differentiator**: We don't promote our own events. We're the "TV guide" of local SBK — curated, reliable, easy
- **Avoid**: competing with individual event organizers on hype/engagement

### Brand Voice
- Useful, neutral, modern, local, concise, community-oriented
- NOT: startup jargon, influencer-style, hype marketing, aggressive growth

---

## 2. Instagram Strategy — Key Decisions

### Instagram = Billboard / Teaser
Instagram is NOT the product. The app is. Instagram serves as:
- A **billboard** to signal LatinGo exists
- A **teaser** that shows SOME events, never ALL
- A **trust builder** proving the app has real, curated content
- A **funnel** → "See all events in the app"

### The Scarcity Rules (Critical)
1. **Never show all events** — carousel shows 4 out of N, closing slide says "+X others on the app"
2. **Never show full details** — show image + title + city + dance type. NO address, NO ticket link, NO full description
3. **Always create curiosity gap** — "Découvre toutes les soirées sur l'app"
4. **Rotate events** — don't always show the same top 4 (vary selection)

### Content Calendar (Weekly)
| Day | Format | Content |
|-----|--------|---------|
| Thursday | Carousel (4:5) | "Où danser ce week-end?" — 4 selected events |
| Friday | Story | "Ce soir" — tonight's highlight event |
| Saturday | Story | "Ce soir" — tonight's highlight |
| Monday (optional) | Story/Reel | Recap or community highlight |

### Instagram Account Setup
- **Handle**: @latingo.app (or @latingo_fr)
- **Bio**: "Toutes les soirées SBK près de chez toi 💃🕺\n📍 Pays Basque · Landes · Béarn\n👇 Télécharge l'app"
- **Link in bio**: App store link (or Linktree with app + website)
- **Highlights**: "Salsa", "Bachata", "Kizomba", "App", "À propos"
- **Profile type**: Business/Creator for Meta API access later

---

## 3. Template System — 8 Templates Designed

### Format Dimensions
- **Carousel**: 1080×1350px (4:5 portrait)
- **Story**: 1080×1920px (9:16)
- **Square**: 1080×1080px (1:1) — Facebook

### Template 1: Weekly Digest Carousel (IMPLEMENTED)
- **Slide 1 — Cover**: "Où danser ce week-end?" + date range + count ("5 soirées, 3 villes")
- **Slides 2-5 — Events**: Event image (cover crop) + date/time badge + title + city + dance type pills
- **Slide 6 — Closing**: "+X autres soirées sur l'app" + CTA + app store badges

### Template 2: "Ce Soir" Story
- Single event highlight for tonight
- Full-bleed image background with gradient overlay
- Title + city + time + dance types
- "Swipe up" / link sticker to app

### Template 3: Dance Type Spotlight
- "3 soirées Bachata ce week-end"
- Filtered by single dance type
- Carousel or story format

### Template 4: City Focus
- "Que faire à Bayonne ce week-end?"
- Events filtered by city
- Local feel

### Template 5: Map Digest (future)
- Visual map with pins
- Shows geographic spread
- "5 soirées autour de toi"

### Template 6: New Event Alert Story
- When a new popular event is scraped
- "Nouvelle soirée ajoutée 🆕"
- Teaser with partial info

### Template 7: Weekly Stats (optional)
- "Cette semaine sur LatinGo"
- X events, X cities, X RSVPs
- Community-building

### Template 8: Seasonal/Thematic
- "Les soirées en plein air cet été"
- "Spécial festivals"
- Manual trigger

---

## 4. Design System — "Noche" Theme

### Colors
- **Background**: `#1a1a2e` (deep navy)
- **Surface**: `#252542` (card backgrounds)
- **Text**: `#FFFFFF`
- **Secondary**: `#a0a0b0`
- **Gold/Accent**: `#f5c542` (dates, highlights)
- **Coral**: `#ff6b6b` (CTAs, counts)

### Dance Type Colors
Each dance type has its own accent + bg:
- Salsa: coral `#ff6b6b`
- Bachata: purple `#a855f7`
- Kizomba: gold `#f5c542`
- Zouk: teal `#2dd4bf`
- Semba: amber `#f59e0b`
- West Coast Swing: blue `#3b82f6`
- Tango: rose `#e11d48`

### Typography
- Font: **DM Sans** (Google Fonts)
- Hero: 700 weight, tight letter-spacing
- Body: 400-500 weight

### Logo
- LatinGo wordmark embedded as base64 PNG
- Positioned as watermark at bottom center (44px height, 0.7 opacity)

---

## 5. Technical Architecture

### Stack
- **Language**: TypeScript
- **Rendering**: React (SSR via `renderToStaticMarkup`) → HTML → Playwright screenshot → PNG
- **Runtime**: Node.js with `--use-system-ca` flag (TLS requirement for api.latingo.fr)
- **Orchestration**: n8n (future), currently manual via npm scripts

### API Integration
- **Base URL**: `https://api.latingo.fr`
- **Auth**: `POST /auth/login` with email/password → Bearer token
- **Events**: `GET /events?date_from=...&date_to=...&sort_by=date_asc`
- **Images**: Cloudflare R2 at `pub-0a74468ba5af4a029f562126cdb5944f.r2.dev/events/{uuid}.jpg`

### Event Selection Algorithm (for carousel)
1. Fetch weekend events (Fri-Sun)
2. Sort by RSVP count (descending)
3. Select top 4 with **city diversity** (don't pick 4 events from same city)
4. Remaining count shown on closing slide

### Image Handling
- Source images vary wildly: 746×1600 (portrait), 800×800 (square), 800×450 (landscape)
- Fixed height container (820px) with `object-fit: cover` + `object-position: center top`
- This guarantees consistent layout regardless of source dimensions
- Fallback: branded gradient pattern when no image exists

---

## 6. Project Structure

```
latingo-media-engine/
├── src/
│   ├── tokens/
│   │   ├── noche.ts          # Design system tokens
│   │   └── dance-types.ts    # Dance type colors + helpers
│   ├── components/
│   │   ├── DanceTypePill.tsx  # Pill component (sm/md/lg)
│   │   ├── EventImage.tsx     # Image with fallback
│   │   └── layouts/
│   │       ├── BaseLayout.tsx           # Root wrapper (dimensions, font, watermark)
│   │       ├── CarouselSlideLayout.tsx  # 1080×1350
│   │       └── StoryLayout.tsx          # 1080×1920
│   ├── renderer/
│   │   └── render.ts         # Playwright renderer (getBrowser, renderToImage, renderBatch)
│   ├── api/
│   │   └── client.ts         # API auth + fetchEvents + fetchWeekendEvents
│   ├── scripts/
│   │   ├── render-real.ts    # Main: renders carousel from real API data
│   │   ├── test-render.ts    # Mock data render
│   │   ├── test-api.ts       # API diagnostic
│   │   └── analyze-images.ts # Image dimension analyzer
│   ├── mock/
│   │   └── events.ts         # 10 fake events for testing
│   ├── utils/
│   │   └── dates.ts          # French date formatting
│   ├── server/
│   │   └── preview.ts        # Express preview server (localhost:3456)
│   └── types/index.ts        # MediaEvent, MediaFormat, DIMENSIONS
├── assets/
│   └── icon-text.png         # LatinGo logo
├── output/                   # Generated images (gitignored)
├── .env                      # API credentials
├── package.json
└── tsconfig.json
```

---

## 7. Implementation Progress

### ✅ Completed
- Phase 0: All strategic decisions locked in
- Phase 1: Full scaffolding, tokens, components, renderer, preview server
- Visual iteration: 4 rounds of fixes (logo display, TLS, image cropping, layout balance)
- Working render pipeline with real API data

### 🔜 Next Steps
- **Phase 2**: Extract inline templates into reusable `src/templates/weekly-digest/` components
- **Phase 3**: n8n orchestration (cron → API query → render → deliver to admin)
- **Phase 4**: Additional templates (Ce Soir story, Dance Type spotlight)
- **Phase 5**: Meta API auto-publishing (requires Instagram Business account)

---

## 8. Key Technical Decisions & Lessons

1. **Playwright over Puppeteer** — better DX, reliable font loading
2. **Base64 logo embedding** — relative URLs don't resolve in `about:blank` page context
3. **`--use-system-ca` flag** — required for Node.js to trust api.latingo.fr TLS cert
4. **Fixed-height image container** — flex-based approaches failed with extreme aspect ratios; 820px fixed height + object-fit: cover is reliable
5. **object-position: center top** — shows the "header" of event posters (usually has the event name/title)
6. **Server-side React** — `renderToStaticMarkup` generates HTML string, Playwright screenshots it. No client hydration needed.

---

## How to Use This Document

Paste this entire file as the first message (or system prompt) to a new assistant. It contains:
- All strategic/brand decisions
- Instagram rules and content calendar
- Template specifications
- Technical architecture
- Current progress
- File structure

The new assistant should also read `prompt.txt` in the project root for the original system design document, and explore the `src/` folder for the current implementation.
