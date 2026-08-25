LatinGo landing site — strategy brief
What LatinGo is (and isn’t)
LatinGo is the single reliable SBK calendar that answers: « Où je danse ce soir / ce week-end, près de moi ? » (salsa, bachata, kizomba — socials, parties, festivals).

Win on completeness, reliability, locality — not by rebuilding Facebook Events or becoming a social network.

Default competitors today: Facebook Events/Groups, WhatsApp groups, Instagram, word of mouth — not other dance apps. Positioning: better discovery than Facebook (filters, alerts, trust) while complementing WhatsApp for coordination (share links into groups; don’t recreate chats/feeds/polls).

Current phase (what the site must serve)
Phase 1 — Dancer pull (through ~Oct 2026). Home wedge: Pays Basque / Basque Country / Landes / Pau (SW France + Spanish Basque Country).

Site job right now:

Get dancers to install on **both stores** (Play: `fr.latingo.app`; App Store: `id6783507682` — both live as of Aug 2026)
Make the value obvious in seconds so people share it in dance circles
Not sell organizer subscriptions yet (monetization is Phase 3)
North star: habit + word of mouth — not vanity feature lists.

Emphasize on the site
Emphasize	Why
The question — « Où sortir danser ce week-end ? »
Core thesis; sticky mental model
Complete local calendar
Aggregated SBK events vs scattered FB/WhatsApp
Near me / map + filters
Styles, dates, Favoris / Populaires / Nouveaux
Reliability — cancellations, up-to-date
Brand = trust; flash is secondary
Radar — alerts when something matches
Retention hook (push/email digests)
Agenda danse — save evenings without login wall on browse
Low friction → habit
Locality — name known places / region
Founder note: citer des endroits connus; feel hyper-local, not generic “France dance app”
Works with WhatsApp
Share events / weekend lists into groups; discovery here, coordination there
Primary CTA: download the app
Marketing site is a funnel into the mobile utility
French UI / French-speaking audience. Atmosphere of real nights out, not a SaaS dashboard.

Soft-pedal or avoid
Avoid	Why
Social network pitch (friends going, chat, feed, follow)
Explicit kill for ~12 months
Fake or inflated user counts
Honest social proof only; early stage (~few WAU)
Organizer monetization / “pro stats” as hero
Phase 2–3; dancer pull first
Ticketing / payments
Out of scope
Multi-country / “Europe’s dance app”
Wedge first; expansion later
Feature dump that sounds like Facebook Events
Strategic trap for a solo bootstrapper
Organizer angle can be a secondary line (“vos soirées y sont déjà listées”) — not the hero in Phase 1.

Product truths the site can claim (shipped)
Browse open without account · list + map · SBK filters · Nouveau / Populaire / Annulé · save to agenda · Radar alerts · share event + “Partager ma sélection” for WhatsApp · event teaser pages at latingo.fr/event/{id} (OG for WhatsApp).

Do not invent features that aren’t shipped (classes/workshops planned later; friend graph never for now).

Infra the redesign must respect
URL	Role
https://latingo.fr/
Marketing (GitHub Pages) — this overhaul
https://latingo.fr/event/{id}
Event teaser via Cloudflare Worker → API (keep working; not the marketing page)
Stores
Play: fr.latingo.app; App Store: id6783507682
Teaser pages stay thin previews that drive app open/download — don’t turn the marketing home into a full web app clone of Découvrir.

Tone / brand principles
Utility, modern, practical — “outil qui centralise les soirées”, not lifestyle magazine
Trust > flash — correct data beats hype copy
Local and concrete — venues/region > abstract “community”
GDPR-aware — no creepy tracking pitch
Founder’s raw com ideas (use selectively)
From strategy parking lot: concept + modernity · local known places · map · Radar alert result · weekend focus · cancellation story · “toutes les soirées locales” · keep organizer ask light. Drop “demander en amis” / social graph framing.

One-line brief for design
French mobile utility for SBK dancers in Pays Basque: the trustworthy calendar that answers where to dance this weekend — install the app, not join another social network.

---

Landing site — shipped (Aug 2026 overhaul)

The marketing page at `landing/` reflects the strategy above. Source of truth: `landing/src/App.tsx` and section components.

Page flow (top → bottom)

| # | Section | Component | Role |
|---|---------|-----------|------|
| — | Nav | `Navbar.tsx` | Logo, links to Organisateurs / FAQ, coral “Télécharger” → `#telecharger` |
| 1 | Hero | `Hero.tsx` | Headline + store CTAs (`#telecharger`) |
| 2 | Problem | `Problem.tsx` | WhatsApp / Facebook / Instagram overload pain points |
| 3 | Features | `Features.tsx` | Filters, map, Radar alerts |
| 4 | Local proof | `LocalProof.tsx` | Cities, venue names, social proof, live stats |
| 5 | Events preview | `EventsPreview.tsx` | Up to 4 cards this week + store CTAs |
| 6 | Screenshots | `Screenshots.tsx` | App carousel (5 slides) |
| 7 | Organizers | `Organizers.tsx` | Secondary recruiter block (`#organisateurs`) |
| 8 | FAQ | `FAQ.tsx` | Accordion (`#faq`) |
| — | Footer | `Footer.tsx` | Social, email, store text links |

Removed since early-access phase: `Download.tsx`, `IOSWaitlist.tsx`, Formspree iOS waitlist. Store CTAs are unified in `StoreButtons.tsx` (Play + App Store badges).

Key copy (as in code)

| Location | Text |
|----------|------|
| Hero H1 | Toutes les soirées SBK du Sud-Ouest, en une seule app |
| Hero sub | Découvre les événements salsa, bachata et kizomba près de chez toi. Disponible sur Android et iOS. |
| Hero hook | 3 secondes pour savoir où sortir ce soir. |
| Features H2 | Une seule app. Toutes les soirées locales. |
| Local H2 | Bienvenue dans le Sud-Ouest. |
| Local venues | Guinguette Kulunka (Bayonne), Soleil des Antilles (Bidart), Café Irún, GU (Saint-Sébastien), New Red Lion (Pau) |
| Local social proof | Plus d'une centaine de danseurs nous font déjà confiance. |
| Stats badge | `{N} événements · {M} lieux à venir` — Sur les 30 prochains jours · mis à jour chaque semaine |
| Events H2 | Cette semaine près de chez toi |
| Organizers hook | Des organisateurs locaux nous ont déjà rejoints. |

Cities shown: Bayonne, Anglet, Biarritz, Dax, Hossegor, Mont-de-Marsan, Pau, Tarbes, Irun, Saint-Sébastien.

Store URLs (`landing/src/constants.ts`)

| Store | URL |
|-------|-----|
| Google Play | `https://play.google.com/store/apps/details?id=fr.latingo.app` |
| App Store | `https://apps.apple.com/app/id6783507682` |

Live event data

- Build-time fetch: `landing/scripts/fetch-events.ts` → `landing/src/data/events.json`
- Stats: all non-cancelled events in the next **30 days** (venues deduped by lat/lng or city)
- Preview cards: up to **4** events, preferring **this week** (7 days), with images first — mirrored at runtime in `landing/src/data/index.ts`
- Refreshed on deploy + daily cron (see `docs/LANDING.md`)

Background images (`landing/public/images/`)

| File | Used in |
|------|---------|
| `hero-dance.png` | Hero |
| `dance-club-crowd.png` | Features |
| `dance-social-neon.png` | EventsPreview (sourced from `pictures/file_00000000…dad3.png`) |
| `dance-coastal-sunset.png` | Organizers |
| App screenshots (`screenshot-*.jpg`) | Screenshots carousel |

Note: `hero-dance.png` / `dance-app-pov.png` and `dance-club-crowd.png` / `indoor-party.png` are duplicate assets on disk — only one of each pair is referenced in components.

FAQ positioning (as shipped)

- Keeps “Disponible sur Android et iOS ?” (both stores live — intentional)
- “Comment vous trouvez les événements ?” → organizers create in-app (aspirational framing for recruitment)
- “Ma ville est-elle disponible…” → Sud-Ouest coverage + contact to add cities
- No sticky bottom-sheet organizer CTA (removed with waitlist flow)

Analytics hooks

`data-event` attributes on store badges, navbar CTA, FAQ expand, organizer mailto, social links — ready for a future analytics script; none wired in `index.html` yet.

Still out of sync with page copy (fix in code, not strategy)

- `landing/index.html` `<title>`, `<meta description>`, and `og:description` still mention old hero copy and “Gratuit sur Android” only.