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
