/**
 * Render all Thursday design concepts for founder review (local PNGs only).
 * Run with: npm run render:thursday-concepts
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { activeEventsOnly, fetchThursdayWindowEvents } from '../api/client';
import { getAreaForEvent } from '../config/areas';
import { closeBrowser, renderToImage } from '../renderer/render';
import {
  CoverA1MoodField,
  CoverA2Magazine,
  CoverA3Collage,
  CoverA4OneWord,
  CoverA5MapWhisper,
  ThursdayEventCard,
  ThursdayManifestoClosing,
  CrossBorderC1Passport,
  CrossBorderC2Itinerary,
  CrossBorderC3PollSplit,
  CrossBorderC4TwoNights,
  DuelD1FloorSplit,
  DuelD2TribePoster,
  DuelD3AlmostTie,
  DuelD4Metaphor,
  DuelD5Radar,
} from '../templates/thursday-concepts';
import { getDanceType } from '../tokens/dance-types';
import { getParisDateLabel, getParisThuSunBounds } from '../utils/paris-time';
import type { MediaEvent } from '../types';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'thursday-concepts');

async function shot(relPath: string, element: React.ReactElement) {
  const outputPath = path.join(OUTPUT_DIR, relPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await renderToImage({ format: 'carousel', outputPath, element });
  console.log(`  ✓ ${relPath}`);
}

function countDance(events: MediaEvent[], slug: string): number {
  return events.filter((e) => (e.dance_types || []).some((d) => d.slug === slug)).length;
}

function pickWithImage(events: MediaEvent[], n: number): MediaEvent[] {
  const withImg = events.filter((e) => e.image_url);
  return (withImg.length >= n ? withImg : events).slice(0, n);
}

async function main() {
  process.env.DRY_RUN = 'true';

  console.log('🔗 Fetching live Thu–Sun events for Thursday concepts...\n');
  const events = activeEventsOnly(await fetchThursdayWindowEvents());
  console.log(`  Found ${events.length} active events\n`);

  const thuSun = getParisThuSunBounds();
  const salsaCount = countDance(events, 'salsa');
  const bachataCount = countDance(events, 'bachata');

  const frenchEvents = events.filter((e) => {
    const a = getAreaForEvent(e);
    return a === 'bab' || a === 'landes' || a === 'bearn';
  });
  const euskadiEvents = events.filter((e) => getAreaForEvent(e) === 'euskadi');

  // Balanced demo counts for C* (production trigger should require balance;
  // concepts use near-equal numbers so the layouts don't look lame).
  const demoFr = Math.max(frenchEvents.length, 8);
  const demoEs = Math.max(euskadiEvents.length, 7);
  const balancedFr = Math.min(demoFr, demoEs + 1);
  const balancedEs = Math.min(demoEs, balancedFr);

  const bachataEvents = events.filter((e) => (e.dance_types || []).some((d) => d.slug === 'bachata'));
  const coverEvents = pickWithImage(bachataEvents.length ? bachataEvents : events, 3);
  const imageUrls = coverEvents.map((e) => e.image_url!).filter(Boolean);

  const areaEvents = pickWithImage(
    events.filter((e) => getAreaForEvent(e) === 'bab'),
    3
  );
  const cardEvent = pickWithImage(areaEvents.length ? areaEvents : events, 1)[0] || events[0];

  const frHero =
    pickWithImage(frenchEvents, 1)[0] ||
    frenchEvents[0] ||
    events[0];
  const esHero =
    pickWithImage(euskadiEvents, 1)[0] ||
    euskadiEvents[0] ||
    events[1] ||
    events[0];

  const frCities = [...new Set(frenchEvents.map((e) => e.city).filter(Boolean))] as string[];
  const esCities = [...new Set(euskadiEvents.map((e) => e.city).filter(Boolean))] as string[];
  const itineraryStops = [
    ...frCities.slice(0, 3).map((city) => ({ city, side: 'FR' as const })),
    ...esCities.slice(0, 2).map((city) => ({ city, side: 'ES' as const })),
  ];
  if (itineraryStops.length < 3) {
    itineraryStops.push(
      { city: 'Bidart', side: 'FR' },
      { city: 'Hondarribia', side: 'ES' },
      { city: 'Donostia', side: 'ES' }
    );
  }

  const styleSlugs = ['salsa', 'bachata', 'kizomba', 'zouk', 'tango-argentin'] as const;
  const radarStyles = styleSlugs
    .map((slug) => ({
      slug,
      label: getDanceType(slug).label_fr,
      count: countDance(events, slug),
    }))
    .filter((s) => s.count > 0);

  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('🎨 Rendering Thursday design concepts...\n');

  // --- A covers ---
  console.log('A — Covers');
  await shot(
    'A-covers/A1-mood-field.png',
    React.createElement(CoverA1MoodField, {
      headline: '23 soirées bachata ce week-end',
      proofLine: 'Jeu–Dim · Sud-Ouest',
      accentSlug: 'bachata',
    })
  );
  await shot(
    'A-covers/A2-magazine.png',
    React.createElement(CoverA2Magazine, {
      headline: '23 soirées bachata ce week-end',
      proofLine: 'Jeu–Dim · Sur LatinGo',
      accentSlug: 'bachata',
    })
  );
  await shot(
    'A-covers/A3-collage.png',
    React.createElement(CoverA3Collage, {
      headline: '23 soirées bachata ce week-end',
      proofLine: '3 teasers · le reste sur l\'app',
      accentSlug: 'bachata',
      imageUrls,
    })
  );
  await shot(
    'A-covers/A4-one-word.png',
    React.createElement(CoverA4OneWord, {
      headline: '',
      heroWord: 'BACHATA',
      proofLine: '23 soirées · Jeu–Dim',
      accentSlug: 'bachata',
    })
  );
  await shot(
    'A-covers/A5-map-whisper.png',
    React.createElement(CoverA5MapWhisper, {
      heroWord: 'BAB',
      headline: 'Que faire ce week-end ?',
      proofLine: '8 soirées · Bayonne · Anglet · Biarritz',
      accentSlug: 'salsa',
    })
  );

  // --- B cards ---
  console.log('\nB — Thursday cards (≠ Tuesday)');
  if (cardEvent) {
    await shot(
      'B-cards/B-thursday-event.png',
      React.createElement(ThursdayEventCard, { event: cardEvent, index: 0, total: 3 })
    );
  }
  await shot(
    'B-cards/B-manifesto-closing.png',
    React.createElement(ThursdayManifestoClosing, { remaining: 20 })
  );

  // --- C cross-border ---
  console.log('\nC — Cross-border (balanced demo counts)');
  await shot(
    'C-cross-border/C1-passport.png',
    React.createElement(CrossBorderC1Passport, {
      frenchCount: balancedFr || 8,
      euskadiCount: balancedEs || 7,
    })
  );
  await shot(
    'C-cross-border/C2-itinerary.png',
    React.createElement(CrossBorderC2Itinerary, {
      frenchCount: balancedFr || 8,
      euskadiCount: balancedEs || 7,
      stops: itineraryStops.slice(0, 5),
    })
  );
  await shot(
    'C-cross-border/C3-poll-split.png',
    React.createElement(CrossBorderC3PollSplit, {
      frenchCount: balancedFr || 8,
      euskadiCount: balancedEs || 7,
      frenchImage: frHero?.image_url,
      euskadiImage: esHero?.image_url,
    })
  );
  if (frHero && esHero) {
    await shot(
      'C-cross-border/C4-two-nights.png',
      React.createElement(CrossBorderC4TwoNights, {
        frenchEvent: frHero,
        euskadiEvent: esHero,
      })
    );
  }

  // --- D duel ---
  console.log('\nD — Salsa vs Bachata / radar');
  await shot(
    'D-duel/D1-floor-split.png',
    React.createElement(DuelD1FloorSplit, { salsaCount, bachataCount })
  );
  await shot(
    'D-duel/D2-tribe-salsa.png',
    React.createElement(DuelD2TribePoster, {
      styleSlug: 'salsa',
      count: salsaCount,
      vibeLine: 'La piste s\'ouvre. Tu suis ?',
    })
  );
  await shot(
    'D-duel/D2-tribe-bachata.png',
    React.createElement(DuelD2TribePoster, {
      styleSlug: 'bachata',
      count: bachataCount,
      vibeLine: 'Plus près. Plus longtemps.',
    })
  );
  await shot(
    'D-duel/D3-almost-tie.png',
    React.createElement(DuelD3AlmostTie, { salsaCount, bachataCount })
  );
  await shot(
    'D-duel/D4-metaphor.png',
    React.createElement(DuelD4Metaphor, { salsaCount, bachataCount })
  );
  await shot(
    'D-duel/D5-radar.png',
    React.createElement(DuelD5Radar, { styles: radarStyles })
  );

  await closeBrowser();

  const summary = [
    '# Thursday design concepts',
    '',
    `- Generated: ${new Date().toISOString()}`,
    `- Paris date: ${getParisDateLabel()}`,
    `- Window: ${thuSun.thursdayLabel} → ${thuSun.sundayLabel}`,
    `- Events: ${events.length}`,
    `- Live counts: salsa=${salsaCount}, bachata=${bachataCount}, FR=${frenchEvents.length}, Euskadi=${euskadiEvents.length}`,
    `- Cross-border demos use balanced counts (${balancedFr || 8}/${balancedEs || 7}) for fair visual review`,
    '',
    '## A — Covers',
    '- A1 mood field',
    '- A2 magazine masthead',
    '- A3 collage teaser',
    '- A4 one word + proof',
    '- A5 map whisper (area)',
    '',
    '## B — Thursday ≠ Tuesday',
    '- B event card (full-bleed overlay)',
    '- B manifesto closing',
    '',
    '## C — Cross-border',
    '- C1 passport stamps',
    '- C2 itinerary',
    '- C3 poll split',
    '- C4 two nights / two countries',
    '',
    '## D — Duel / stats alternatives',
    '- D1 floor split',
    '- D2 tribe posters (salsa + bachata)',
    '- D3 almost-tie drama',
    '- D4 vibe metaphor',
    '- D5 radar styles',
    '',
    'Pick winners per slot, then we lock production templates.',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'SUMMARY.md'), summary, 'utf-8');
  console.log(`\n✅ Concepts complete → ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('❌ Thursday concepts failed:', err);
  process.exit(1);
});
