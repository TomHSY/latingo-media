/**
 * Render story-D variant (full center urgency).
 * Run with: npx tsx --use-system-ca src/scripts/render-story-d.ts
 */
import React from 'react';
import path from 'path';
import fs from 'fs';
import { renderToImage, closeBrowser } from '../renderer/render';
import { fetchWeekendEvents, fetchEvents } from '../api/client';
import { StoryLayout } from '../components/layouts/StoryLayout';
import { DanceTypePills } from '../components/DanceTypePill';
import { colors, typography } from '../tokens/noche';
import { formatTimeFrench } from '../utils/dates';
import type { MediaEvent } from '../types';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'compare', 'stories', 'story-D');
const logoBase64 = fs.readFileSync(path.resolve(__dirname, '..', 'assets', 'icon-text.png')).toString('base64');
const logo2Base64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'icon-text2.png')).toString('base64');

function makeBackdrop(imageUrl: string | null) {
  return React.createElement(
    'div',
    { key: 'bg', style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' } },
    imageUrl
      ? React.createElement('img', {
          src: imageUrl,
          style: { position: 'absolute', top: '-20px', left: '-20px', width: 'calc(100% + 40px)', height: 'calc(100% + 40px)', objectFit: 'cover', filter: 'blur(20px) brightness(0.3)' },
        })
      : null,
    React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,15,20,0.45)' } })
  );
}

function renderStoryD(event: MediaEvent) {
  const startDt = new Date(event.start_datetime);
  return React.createElement(
    StoryLayout,
    { showWatermark: false },
    makeBackdrop(event.image_url),
    React.createElement(
      'div',
      { style: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', textAlign: 'center' } },
      // CE SOIR — HUGE
      React.createElement('div', {
        style: { color: colors.coral, fontSize: '100px', fontWeight: 900, letterSpacing: '8px', lineHeight: '104px', marginBottom: '12px' },
      }, 'CE SOIR'),
      // Time + Location — side by side
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' } },
        React.createElement('span', {
          style: { color: colors.gold, fontSize: '42px', fontWeight: 700 },
        }, `à ${formatTimeFrench(startDt)}`),
        React.createElement('span', {
          style: { color: colors.text, fontSize: '34px', fontWeight: 600, opacity: 0.9 },
        }, `📍 ${event.city || 'Lieu à confirmer'}`)
      ),
      // Image — contain, not cropped
      React.createElement(
        'div',
        { style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '48px', maxHeight: '780px' } },
        event.image_url
          ? React.createElement('img', { src: event.image_url, style: { maxWidth: '100%', maxHeight: '780px', objectFit: 'contain', borderRadius: '16px' } })
          : React.createElement('div', { style: { width: '100%', height: '400px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)' } })
      ),
      // Title
      React.createElement('h1', {
        style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '46px', lineHeight: '54px', color: colors.text, marginBottom: '16px' },
      }, event.title),
      // Pills
      React.createElement(DanceTypePills, { danceTypes: event.dance_types, size: 'lg', gap: '10px' }),
      // Logo — big, with breathing room
      React.createElement('img', {
        src: `data:image/png;base64,${logoBase64}`,
        style: { height: '240px', opacity: 0.9, marginTop: '80px' },
      })
    )
  );
}

async function main() {
  console.log('🔗 Fetching events...\n');

  let events = await fetchWeekendEvents();
  if (events.length === 0) {
    const now = new Date();
    const twoWeeks = new Date(now);
    twoWeeks.setDate(now.getDate() + 14);
    events = await fetchEvents({
      date_from: now.toISOString(),
      date_to: twoWeeks.toISOString(),
      sort_by: 'date_asc',
    });
  }

  if (events.length === 0) {
    console.log('❌ No events found.');
    process.exit(1);
  }

  const sorted = [...events].sort((a, b) => (b.rsvp_count || 0) - (a.rsvp_count || 0));
  const testEvents = selectDiverseEvents(sorted, 4);

  console.log(`  Using ${testEvents.length} events:`);
  testEvents.forEach((e, i) => console.log(`    ${i + 1}. ${e.title} (${e.city})`));
  console.log('');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('  📐 Rendering story-D...');
  for (let i = 0; i < testEvents.length; i++) {
    await renderToImage({
      format: 'story',
      outputPath: path.join(OUTPUT_DIR, `${i + 1}-${(testEvents[i].city || 'event').toLowerCase().replace(/\s+/g, '-')}.png`),
      element: renderStoryD(testEvents[i]),
    });
  }

  await closeBrowser();
  console.log('\n✅ Done! Check output/compare/stories/story-D/');
}

function selectDiverseEvents(sorted: MediaEvent[], count: number): MediaEvent[] {
  const selected: MediaEvent[] = [];
  const usedCities = new Set<string>();
  for (const event of sorted) {
    if (selected.length >= count) break;
    const city = event.city || '';
    if (!usedCities.has(city) || selected.length >= count - 1) {
      selected.push(event);
      usedCities.add(city);
    }
  }
  if (selected.length < count) {
    for (const event of sorted) {
      if (selected.length >= count) break;
      if (!selected.includes(event)) selected.push(event);
    }
  }
  return selected;
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
