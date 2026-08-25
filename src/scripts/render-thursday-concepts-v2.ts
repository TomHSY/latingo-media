/**
 * Refined Thursday concept picks after founder feedback.
 * Run with: npm run render:thursday-concepts-v2
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { activeEventsOnly, fetchThursdayWindowEvents } from '../api/client';
import {
  AREA_FOCUS_HEADLINES,
  type AreaSlug,
  getAreaForEvent,
} from '../config/areas';
import { closeBrowser, renderToImage } from '../renderer/render';
import {
  CoverA2Magazine,
  CoverA2RegionFocus,
  ThursdayEventCard,
  ThursdayManifestoClosing,
  CrossBorderC3PollSplit,
  DuelD1FloorSplit,
  DuelD5Radar,
} from '../templates/thursday-concepts';
import { getDanceType } from '../tokens/dance-types';
import type { MediaEvent } from '../types';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'thursday-concepts-v2');

const REGION_ACCENTS: Record<AreaSlug, string> = {
  bab: 'salsa',
  landes: 'bachata',
  bearn: 'kizomba',
  euskadi: 'zouk',
};

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

  console.log('🔗 Fetching live Thu–Sun events for refined concepts...\n');
  const events = activeEventsOnly(await fetchThursdayWindowEvents());
  console.log(`  Found ${events.length} active events\n`);

  const salsaCount = countDance(events, 'salsa');
  const bachataCount = countDance(events, 'bachata');

  const frenchBasque = events.filter((e) => getAreaForEvent(e) === 'bab');
  const spanishBasque = events.filter((e) => getAreaForEvent(e) === 'euskadi');
  const frCount = frenchBasque.length;
  const esCount = spanishBasque.length;

  const cardEvent =
    pickWithImage(frenchBasque.length ? frenchBasque : events, 1)[0] || events[0];

  const frHero = pickWithImage(frenchBasque, 1)[0] || frenchBasque[0] || events[0];
  const esHero = pickWithImage(spanishBasque, 1)[0] || spanishBasque[0] || events[1] || events[0];

  const demoFr = Math.max(frCount, 4);
  const demoEs = Math.max(esCount, 4);

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

  console.log('🎨 Rendering refined picks...\n');

  await shot(
    'A2-magazine-dance.png',
    React.createElement(CoverA2Magazine, {
      headline: '23 soirées bachata ce week-end',
      proofLine: 'Jeudi – Dimanche',
      accentSlug: 'bachata',
    })
  );

  for (const slug of Object.keys(AREA_FOCUS_HEADLINES) as AreaSlug[]) {
    await shot(
      `A2-region-${slug}.png`,
      React.createElement(CoverA2RegionFocus, {
        headline: AREA_FOCUS_HEADLINES[slug],
        proofLine: 'Jeudi – Dimanche',
        accentSlug: REGION_ACCENTS[slug],
      })
    );
  }

  if (cardEvent) {
    await shot(
      'B-event-card.png',
      React.createElement(ThursdayEventCard, { event: cardEvent, index: 0, total: 3 })
    );
  }
  await shot(
    'B-manifesto-closing.png',
    React.createElement(ThursdayManifestoClosing, { remaining: 20 })
  );

  await shot(
    'C3-pays-basque.png',
    React.createElement(CrossBorderC3PollSplit, {
      frenchCount: demoFr,
      euskadiCount: demoEs,
      frenchImage: frHero?.image_url,
      euskadiImage: esHero?.image_url,
    })
  );

  await shot(
    'D1-floor-split.png',
    React.createElement(DuelD1FloorSplit, { salsaCount, bachataCount })
  );
  await shot(
    'D5-radar.png',
    React.createElement(DuelD5Radar, { styles: radarStyles })
  );

  await closeBrowser();

  const summary = [
    '# Thursday concepts v2',
    '',
    '## A2 magazine',
    '- Dance spotlight example',
    '- Region focus ×4:',
    ...Object.entries(AREA_FOCUS_HEADLINES).map(([slug, line]) => `  - ${slug}: ${line}`),
    '',
    '## Rest of shortlist',
    '- B event + manifesto',
    '- C3 Pays Basque France / Espagne',
    '- D1 floor split',
    '- D5 Radar danse',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'SUMMARY.md'), summary, 'utf-8');
  console.log(`\n✅ Refined concepts → ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('❌ Refined concepts failed:', err);
  process.exit(1);
});
