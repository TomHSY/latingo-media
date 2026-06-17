/**
 * Render stories for ALL events in a given week.
 * Usage: npx tsx --use-system-ca src/scripts/render-week-stories.ts 2026-06-01
 * Output: output/week-2026-06-01/stories/
 */
import React from 'react';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { renderToImage, closeBrowser } from '../renderer/render';
import { fetchEvents } from '../api/client';
import { EventStory } from '../templates/ce-soir';
import type { MediaEvent } from '../types';

const pinBase64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'pin_large.png')).toString('base64');

async function main() {
  const arg = process.argv[2];
  let weekStart: Date;

  if (arg) {
    weekStart = new Date(arg + 'T00:00:00');
    if (isNaN(weekStart.getTime())) {
      console.error('❌ Invalid date. Usage: npx tsx --use-system-ca src/scripts/render-week-stories.ts 2026-06-01');
      process.exit(1);
    }
  } else {
    weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const folderName = `week-${weekStart.toISOString().slice(0, 10)}`;
  const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', folderName, 'stories');

  console.log(`📅 Rendering ALL stories for week: ${weekStart.toISOString().slice(0, 10)} → ${weekEnd.toISOString().slice(0, 10)}`);
  console.log(`📁 Output folder: output/${folderName}/stories/\n`);

  console.log('🔗 Fetching events from api.latingo.fr...\n');

  const events = await fetchEvents({
    date_from: weekStart.toISOString(),
    date_to: weekEnd.toISOString(),
    sort_by: 'date_asc',
    include_past: true,
  });

  console.log(`  Found ${events.length} events\n`);

  if (events.length === 0) {
    console.log('❌ No events found for this week.');
    process.exit(1);
  }

  // Render a story for every event
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const idx = String(i + 1).padStart(2, '0');
    const safeCity = (event.city || 'unknown').replace(/[^a-zA-Z0-9À-ÿ\-]/g, '_');
    const filename = `${idx}-${safeCity}.png`;

    console.log(`  → [${idx}/${events.length}] ${event.title} (${event.city})...`);

    await renderToImage({
      format: 'story',
      outputPath: path.join(OUTPUT_DIR, filename),
      element: React.createElement(EventStory, { event, pinBase64 }),
    });
  }

  await closeBrowser();
  console.log(`\n✅ ${events.length} stories rendered!`);
  console.log(`   Output: output/${folderName}/stories/`);
}

main().catch((err) => {
  console.error('❌ Render failed:', err);
  process.exit(1);
});
