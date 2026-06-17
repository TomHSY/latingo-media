import React from 'react';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { renderToImage, closeBrowser } from '../renderer/render';
import { fetchEvents } from '../api/client';
import { EventSlide } from '../templates/weekly-digest';
import { EventStory } from '../templates/ce-soir';
import type { MediaEvent } from '../types';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'week-2026-06-07');
const pinBase64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'pin_large.png')).toString('base64');

function selectDiverseEvents(sorted: MediaEvent[], count: number, exclude: string[]): MediaEvent[] {
  const selected: MediaEvent[] = [];
  const usedCities = new Set<string>();
  for (const event of sorted) {
    if (selected.length >= count) break;
    if (exclude.includes(event.id)) continue;
    const city = event.city || '';
    if (!usedCities.has(city) || selected.length >= count - 1) {
      selected.push(event);
      usedCities.add(city);
    }
  }
  if (selected.length < count) {
    for (const event of sorted) {
      if (selected.length >= count) break;
      if (exclude.includes(event.id)) continue;
      if (!selected.includes(event)) selected.push(event);
    }
  }
  return selected;
}

async function main() {
  const events = await fetchEvents({
    date_from: '2026-06-07T00:00:00',
    date_to: '2026-06-14T00:00:00',
    sort_by: 'date_asc',
    include_past: true,
  });

  // Find the SBRK event to exclude
  const sbrk = events.find(e => e.title.includes('SBRK') && e.city?.includes('Hossegor'));
  if (!sbrk) { console.error('SBRK event not found'); process.exit(1); }

  // Only consider events from June 8 onwards (this week, not past)
  const weekStart = new Date('2026-06-08T00:00:00');
  const thisWeekEvents = events.filter(e => new Date(e.start_datetime) >= weekStart);

  // Original selected (excluding SBRK): keep the other 3 cities
  const otherSelected = ['Saint-Paul-lès-Dax', 'Bordères', 'Anglet'];
  const sorted = [...thisWeekEvents].sort((a, b) => (b.rsvp_count || 0) - (a.rsvp_count || 0));

  // Find the replacement: next best event not in the other 3 cities and not SBRK
  const replacement = sorted.find(e =>
    e.id !== sbrk.id &&
    !otherSelected.includes(e.city || '')
  );

  if (!replacement) { console.error('No replacement found'); process.exit(1); }
  console.log('Replacing SBRK with:', replacement.title, '-', replacement.city);

  console.log('Rendering carousel slide 02...');
  await renderToImage({
    format: 'carousel',
    outputPath: path.join(OUTPUT_DIR, 'carousel', '02-event.png'),
    element: React.createElement(EventSlide, { event: replacement, pinBase64 }),
  });

  await closeBrowser();
  console.log('Done!');
}
main().catch(e => { console.error(e); process.exit(1); });
