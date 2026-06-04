# LatinGo Landing Page — Build Prompt

> This prompt produces a complete, deployable landing page for LatinGo.
> The page converts local SBK dancers into Early Access members.

---

## PROJECT SETUP

Create the landing page inside this `landing/` folder with:

- **React 18 + Vite + TypeScript**
- **Tailwind CSS 3** (configured with custom design tokens below)
- Single-page app (`index.html` + one `App.tsx` entry)
- Deployable to **GitHub Pages** (`vite.config.ts` with `base: '/'`)
- `package.json` with scripts: `dev`, `build`, `preview`
- All images served from `landing/public/images/`
- Responsive: mobile-first (375px baseline), scales to desktop

---

## DESIGN SYSTEM

### Colors (extend Tailwind config)

```js
colors: {
  background: '#0F0F14',
  surface: '#1C1C24',
  coral: '#FF4E3A',
  gold: '#FFB830',
  'primary-text': '#F5F0EA',
  'secondary-text': '#9B97A3',
}
```

### Typography

- Font family: **"DM Sans"** (import from Google Fonts — weights 400, 500, 700)
- Headings: Bold (700), large
- Body: Regular (400), 16–18px base
- All text in French

### Style Guidelines

- Premium, nightlife, modern, minimalist
- Dark theme throughout (no light mode)
- Generous whitespace between sections
- Rounded corners: `rounded-lg` to `rounded-2xl`
- Subtle coral→gold gradient for accents (borders, decorative elements)
- No hard borders — use surface color differentiation and subtle shadows
- Smooth scroll behavior
- Subtle fade-in animations on scroll (use Intersection Observer, no heavy library)

---

## IMAGE ASSETS

As part of the build setup, **physically copy and rename** the following files from the repository's `pictures/` folder (located at `../pictures/` relative to `landing/`) into `landing/public/images/`. Create the destination directory if it doesn't exist. Use these exact destination names:

| Source file | Destination | Usage |
|-------------|-------------|-------|
| `file_00000000480c720a9235ebe5481ca21a.png` | `hero-dance.png` | Hero section background (AI lifestyle — woman entering venue) |
| `file_0000000065a871f4be5a20bdd35d8f20.png` | `community-sunset.png` | Local proof section (outdoor social, coastal sunset) |
| `file_00000000b518720abe555c25417e81e2.png` | `indoor-party.png` | Problem section subtle background |
| `Screenshot_20260601_145343_LatinGo Dev.jpg` | `screenshot-map.jpg` | App screenshot: map view with event pins |
| `Screenshot_20260601_145524_LatinGo Dev.jpg` | `screenshot-radar.jpg` | App screenshot: radar/alert configuration |
| `file_000000003abc71f48192fd0ebebd8ddf.png` | `screenshot-discover.png` | Promo graphic: phone mockup with event feed |
| `feature_graphics.png` | `og-image.png` | OpenGraph social sharing image |
| `latingo_play_store_icon.png` | `icon.png` | Favicon source + header logo icon |

---

## PAGE STRUCTURE

Single scrollable page. All sections stack vertically.

---

### Section 1: NAVIGATION (Fixed)

- Fixed top bar, transparent background → becomes `surface` on scroll (add backdrop blur)
- Left: LatinGo icon (`icon.png`, 32px) + "LatinGo" text in bold
- Right: CTA button (small, coral): "Accès anticipé" → smooth-scrolls to `#inscription`
- Transition: background opacity animated on scroll

---

### Section 2: HERO

- **Full viewport height** on mobile, 80vh on desktop
- **Background:** `hero-dance.png` filling the section, with a gradient overlay:
  - Top: `rgba(15,15,20, 0.3)`
  - Bottom: `rgba(15,15,20, 0.95)` (solid at bottom so text is perfectly readable)
- **Content** (centered, positioned in lower third):
  - H1: **"Trouve les soirées Salsa, Bachata et Kizomba près de chez toi."**
  - Subtitle (secondary text color): "Tous les événements SBK du Pays Basque, des Landes et de Pau. En une seule app."
  - CTA button (coral, large, full-width on mobile, auto on desktop): **"Rejoindre l'accès anticipé →"**
  - Button smooth-scrolls to `#inscription`
- **Typography:** H1 at 28–32px mobile, 48px desktop. Subtitle at 16–18px.

---

### Section 3: PROBLEM (Empathy)

- **Background:** `surface` (#1C1C24)
- Optional: `indoor-party.png` as background at 8–10% opacity with dark overlay
- **H2:** "Tu rates des soirées. C'est normal."
- **Three pain points** as styled paragraphs with leading emoji/icons:
  1. 📱 "Les événements sont éparpillés entre Facebook, Instagram et le bouche-à-oreille."
  2. 📸 "Tu découvres une soirée le lendemain sur les stories de quelqu'un."
  3. 💬 "Tu ne sais jamais ce qui se passe ce week-end sans demander dans 4 groupes WhatsApp."
- Tone: casual, relatable. Short sentences.
- Max-width: 640px, centered.

---

### Section 4: FEATURES (Solution) + APP SCREENSHOTS

- **Background:** `background` (#0F0F14)
- **H2:** "Une seule app. Toutes les soirées."

- **Layout:** Two-column on desktop (features left, screenshots right). Single column stacked on mobile.

#### Left column: Feature cards

Three cards, vertical stack:

| Icon | Title | Description |
|------|-------|-------------|
| 🗺️ or map pin SVG | **Tout sur une carte** | Soirées, stages, festivals — géolocalisés autour de toi. |
| 🎵 or filter SVG | **Filtre par style** | Salsa, Bachata, Kizomba — ou les trois. |
| 🔔 or bell SVG | **Alertes personnalisées** | Reçois une notification quand un événement match tes critères. |

- Card styling: `surface` background, `rounded-xl`, padding 24px
- Each card: coral/gold colored icon, white title (bold), secondary text description
- Subtle hover lift effect on desktop (translate-y -2px + shadow)

#### Right column: App screenshots

- Display `screenshot-map.jpg` and `screenshot-radar.jpg` as two phone screenshots, slightly overlapping or stacked with rotation
- Wrap in a subtle phone-frame effect (rounded corners + dark border) OR display raw with rounded-2xl and shadow
- On mobile: show screenshots horizontally scrollable or stacked below the feature cards
- These screenshots are the KEY trust signal — they prove the app is real and polished

---

### Section 5: LOCAL PROOF

- **Background:** `background` (#0F0F14)
- **H2:** "Déjà actif dans ta région."

- **Layout:** Two columns on desktop. Image left, content right. Stacked on mobile.
- **Left:** `community-sunset.png` (large, `rounded-xl`, subtle shadow, object-cover)
- **Right:**
  - City pills/tags displayed as rounded badges (surface bg, secondary text):
    - Bayonne, Biarritz, Anglet, Pau, Dax, Hossegor, Saint-Jean-de-Luz, Mont-de-Marsan
  - Below pills: "Nouvelles villes ajoutées chaque semaine." (secondary text, italic)
  - Small stat: "46 événements référencés ce mois-ci" (coral text, bold) — this number is visible in the map screenshot

---

### Section 6: HOW IT WORKS

- **Background:** `surface` (#1C1C24)
- **H2:** "Simple comme 1, 2, 3."

- **Three steps** in a horizontal row (desktop) or vertical stack (mobile):
  1. Numbered circle (coral gradient bg, white number) + "**Ouvre l'app**" + "Découvre la carte des événements autour de toi."
  2. Numbered circle + "**Filtre**" + "Par style, date ou distance."
  3. Numbered circle + "**Danse**" + "Plus jamais de soirée ratée."

- Between steps on desktop: a subtle dashed line or arrow connecting the circles
- Keep this section compact and scannable

---

### Section 7: DISCOVER SCREEN SHOWCASE

- **Background:** `background` (#0F0F14)
- **Full-width centered:** Display `screenshot-discover.png` (the promo graphic with phone mockup showing event feed)
- This image already contains its own headline ("Trouvez toutes les soirées SBK autour de vous") and LatinGo branding
- Display it large (max-width 500px on mobile, 600px on desktop), centered
- No additional text needed — the image speaks for itself
- Add a subtle glow/shadow effect behind it (coral tinted box-shadow)

---

### Section 8: EARLY ACCESS FORM (id="inscription")

- **Background:** `background` (#0F0F14)
- **Centered card:** `surface` background, max-width 480px, `rounded-2xl`, padding 32–40px
- **H2:** "Rejoins l'accès anticipé."
- **Subtitle** (secondary text): "L'app est prête. On ouvre l'accès par vagues aux danseurs de la région."

#### Form fields:

```
Prénom            [text input, required, placeholder: "Ton prénom"]
Email             [email input, required, placeholder: "ton@email.com"]
Ton téléphone     [two pill toggle buttons: Android | iPhone] (required)
Ville             [text input, optional, placeholder: "Bayonne, Pau, Dax..."]
```

#### Input styling:
- Background: `#0F0F14` (background color)
- Border: 1px `#2a2a35`
- Rounded: `rounded-lg`
- Padding: 12px 16px
- Text: `primary-text`
- Placeholder: `secondary-text`
- Focus: ring/border in coral

#### Device selector:
- Two pill buttons side by side (50/50 width)
- **Selected state:** coral background + white bold text
- **Unselected state:** surface-like bg (`#2a2a35`) + secondary text
- Toggle behavior (only one can be selected)

#### CTA button:
- Full-width
- Background: coral (#FF4E3A)
- Text: white, bold
- Rounded: `rounded-lg`
- Padding: 16px
- Text: **"Je veux mon accès →"**
- Hover: slightly lighter coral + subtle lift

#### Micro-copy (below button):
- Small text, secondary color, centered
- "Pas de spam. Juste un lien de téléchargement quand c'est ton tour."

#### Form behavior:
- **On submit:** Construct a `mailto:contact@latingo.fr` link with:
  - Subject: `Nouvel inscrit Early Access — {prénom}`
  - Body: formatted text with all field values:
    ```
    Prénom: {value}
    Email: {value}
    Appareil: {Android|iPhone}
    Ville: {value or "Non renseignée"}
    ```
- Open the mailto link via `window.location.href`
- After opening: replace the form with a success state:
  - Green checkmark icon
  - "✓ Demande envoyée !"
  - "On te recontacte très vite avec ton lien de téléchargement."
- **Validation:** Check required fields before submit. Show inline error messages in coral below the invalid field.

---

### Section 9: TRUST

- **Background:** `surface` (#1C1C24)
- Centered, short section:
  - Large quote marks (decorative, coral/gold color, low opacity)
  - Quote: **"Créé par un danseur du coin qui en avait marre de rater des soirées."**
  - Below: "Un projet indépendant, conçu pour la communauté SBK locale." (secondary text)
- Keep minimal. No photo. Anonymous.
- Max-width 600px, centered.

---

### Section 10: FAQ

- **Background:** `background` (#0F0F14)
- **H2:** "Questions fréquentes"
- **Accordion component** (click to expand/collapse, one open at a time):

| Question | Answer |
|----------|--------|
| C'est gratuit ? | Oui, totalement gratuit pour les danseurs. |
| C'est quoi l'accès anticipé ? | L'app est prête. On l'ouvre progressivement pour garantir la meilleure expérience possible. |
| Comment vous trouvez les événements ? | On regroupe les sources locales (réseaux sociaux, organisateurs, bouche-à-oreille) et on vérifie chaque événement. |
| Android et iPhone ? | Les deux sont supportés. |
| Je suis organisateur, comment référencer mes événements ? | Écris-nous à contact@latingo.fr — on les ajoute gratuitement. |

- Accordion styling: surface bg for items, `rounded-lg`, plus/minus or chevron icon, smooth height transition
- Answer text in secondary color

---

### Section 11: FOOTER

- **Background:** `#0a0a0e` (slightly darker than background)
- **Content (centered):**
  - LatinGo icon + name (small)
  - Separator line (subtle, `#1C1C24`)
  - "Tu organises des soirées SBK ?" → link: **"Référence tes événements gratuitement"** (coral text, links to `mailto:contact@latingo.fr?subject=Référencer mes événements`)
  - Separator
  - Small legal: "© 2026 LatinGo. Tous droits réservés." + "contact@latingo.fr"
  - Optional: Instagram icon link (if you have one)

---

## SEO & META

In `index.html`:

```html
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LatinGo — Soirées Salsa, Bachata, Kizomba au Pays Basque et Landes</title>
  <meta name="description" content="Trouve toutes les soirées Salsa, Bachata et Kizomba près de chez toi. Pays Basque, Landes, Pau. Gratuit." />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="LatinGo — Ne rate plus aucune soirée SBK" />
  <meta property="og:description" content="L'app qui regroupe tous les événements Salsa, Bachata et Kizomba de ta région. Accès anticipé gratuit." />
  <meta property="og:image" content="/images/og-image.png" />
  <meta property="og:locale" content="fr_FR" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/png" href="/images/icon.png" />
</head>
```

---

## ANALYTICS EVENTS (Data Attributes)

Add `data-event` attributes to interactive elements for future analytics integration:

| Element | data-event value |
|---------|-----------------|
| Hero CTA button | `cta_hero_click` |
| Nav CTA button | `cta_nav_click` |
| Form first field focus | `form_focus` |
| Device toggle (Android) | `device_android` |
| Device toggle (iPhone) | `device_iphone` |
| Form submit | `form_submit` |
| FAQ item expand | `faq_expand_{index}` |
| Organizer footer link | `organizer_contact` |

---

## COMPONENT ARCHITECTURE

```
src/
  App.tsx              — Main layout, sections composed
  components/
    Navbar.tsx         — Fixed nav with scroll detection
    Hero.tsx           — Full-screen hero with background image
    Problem.tsx        — Pain points section
    Features.tsx       — Feature cards + app screenshots
    LocalProof.tsx     — Community image + city pills
    HowItWorks.tsx     — 3-step process
    Showcase.tsx       — Discover screen promo image
    EarlyAccessForm.tsx — Form with validation + mailto submit
    Trust.tsx          — Quote section
    FAQ.tsx            — Accordion
    Footer.tsx         — Footer with organizer CTA
  hooks/
    useScrollSpy.ts    — Scroll detection for navbar bg
    useInView.ts       — Intersection Observer for fade-in animations
```

---

## IMPORTANT NOTES

- **Language:** Everything in French. No English anywhere on the page.
- **No external dependencies** beyond React, Vite, Tailwind, and their standard tooling. No animation libraries, no form libraries, no UI kits.
- **Performance:** Lazy-load images below the fold. Use `loading="lazy"` on img tags except hero.
- **Accessibility:** Proper heading hierarchy (single H1), alt texts on images, focusable form elements, aria labels on the accordion.
- **No placeholder content:** Every text on this page is final copy — use exactly what's written in this prompt.
- The `mailto:` approach is intentional for V1. No backend needed.
