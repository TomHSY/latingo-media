# Decisions

Locked technical and product choices. Add new rows when making irreversible decisions — don't revisit without good reason.

| Date | Decision | Reasoning |
|------|----------|-----------|
| — | Playwright over Puppeteer | Better DX, reliable font loading |
| — | Base64 logo embedding | Relative URLs don't resolve in `about:blank` |
| — | `tsx --use-system-ca` in npm scripts | Node must trust api.latingo.fr TLS cert |
| — | Fixed 820px image container | Flex failed with extreme aspect ratios; object-fit cover is reliable |
| — | `object-position: center top` | Event posters usually put title at top |
| — | Server-side React only | No client hydration; renderToStaticMarkup + screenshot |
| 2026-06 | Carousels exclude cancelled events client-side | API includes but deprioritizes cancelled; digest must not promote dead events |
| 2026-06 | Stories show cancelled events with visual mark | Users need to know when a soirée is off; trust positioning |
| — | Instagram = teaser, app = product | Scarcity rules; no full event details on social |
| — | Separate repo from latingo-app | Media engine is read-only API consumer; independent deploy cadence |
| — | Landing in same repo, separate build | Shared brand; `landing/` has own Vite config and GitHub Pages deploy |
| 2026-08-21 | Own-channel Meta publishing is sanctioned | Publishing to **our own** IG/FB via Graph API is in scope. Distinct from latingo-app's killed **WhatsApp group automation** (third-party groups, ban risk). See latingo-app `DECISIONS.md` 2026-08-21. |
| 2026-08-21 | Lead with completeness, not user count | Marketing copy uses event-completeness ("500+ soirées") not install/user counts until scale justifies it. Aligns with neutral brand voice. |
| 2026-08-21 | Facebook Page publish — enable next | Code exists in `src/publisher/facebook.ts`; deferred only until `FB_PAGE_ACCESS_TOKEN` + `FB_PAGE_ID` are set. Promote from "future" to near-term. |
| 2026-08-25 | Instagram calendar: ~3 feed/week + daily stories | Daily 12:00 CE SOIR (+ ANNULÉE as needed). Tue 14:00 carousel. Wed app/founder (manual). Thu lens rotation. Mon/Fri–Sun no fixed feed. No daily “new event” on IG — discovery stays in-app. |
| 2026-08-25 | Thursday lens cycle | `dance → area → dance → stats → area → dance → area → stats` (repeat). Prefer dance/area; stats every 4th week in the cycle. Avoid same-week event overlap with Tue carousel. |
| 2026-08-25 | Thursday event window | Thu–Sun only (Europe/Paris), forward-looking. Not full ISO week. Exclude Tuesday carousel event IDs before selection. |
| 2026-08-25 | Thursday geography | **Area** not city: BAB, Landes, Béarn, Euskadi. City → area mapping in `src/config/areas.ts`. |
| 2026-08-25 | SBK tier selection | Dance spotlights prioritize pure / partial-SBK events over full SBK when picking 3 cards. Copy adapts when mix is mostly SBK. |
| 2026-08-25 | Rare dances bundle | Zouk, Semba, WCS, Tango grouped as **autres danses** single spotlight. Trigger ≥ 3 combined events in Thu–Sun window. |
| 2026-08-25 | Thursday slot variants | Stats: Salsa vs Bachata duel when both ≥ 5. Area: cross-border FR/ES when Euskadi ≥ 4 and French areas ≥ 4 combined. |
| 2026-08-25 | Thursday publish gate | **Founder must review rendered template before any Thursday publish.** Preview renders Wed (DRY_RUN); publish requires manual `workflow_dispatch` only — no auto cron with `DRY_RUN=false`. |
