/**
 * Render carousel + story with REAL events from the API.
 * Run with: npm run render:real
 */
import React from 'react';
import path from 'path';
import fs from 'fs';
import { renderToImage, closeBrowser } from '../renderer/render';
import { fetchWeekendEvents, fetchEvents, activeEventsOnly } from '../api/client';
import { CoverSlide, EventSlide, ClosingSlide } from '../templates/weekly-digest';
import { EventStory } from '../templates/ce-soir';
import { getParisCalendarWeekCover } from '../utils/paris-time';
import { selectSpicyEvents } from '../utils';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'real');
const logoBase64 = fs.readFileSync(path.resolve(__dirname, '..', 'assets', 'icon-text.png')).toString('base64');
const pinBase64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'pin_large.png')).toString('base64');

async function main() {
  console.log('\u{1F517} Fetching real events from api.latingo.fr...\n');

  let events = await fetchWeekendEvents();

  if (events.length === 0) {
    console.log('  No weekend events, fetching next 14 days...');
    const now = new Date();
    const twoWeeks = new Date(now);
    twoWeeks.setDate(now.getDate() + 14);
    events = await fetchEvents({
      date_from: now.toISOString(),
      date_to: twoWeeks.toISOString(),
      sort_by: 'date_asc',
    });
  }

  console.log("  Found " + events.length + " events\n");

  if (events.length === 0) {
    console.log('\u274C No events found. Cannot render.');
    process.exit(1);
  }

  const activeEvents = activeEventsOnly(events);
  const { selected, recurringPenalizedCount, recurringCandidates, droppedDuplicates } = selectSpicyEvents(activeEvents, 4);
  const weekCover = getParisCalendarWeekCover();

  console.log("  Selected " + selected.length + " events for carousel:");
  selected.forEach((e) => console.log("    \u2022 " + e.title + " (" + e.city + ")"));
  if (recurringPenalizedCount > 0) {
    console.log('  Applied recurring down-rank heuristic to selection candidates.');
  }
  if (recurringCandidates.length > 0) {
    console.log('  Likely recurring candidates detected:');
    recurringCandidates.forEach((e) => console.log("    - " + e.title + " (" + (e.city || 'unknown') + ")"));
  }
  if (droppedDuplicates.length > 0) {
    console.log("  Collapsed " + droppedDuplicates.length + " duplicate row(s): kept/dropped " + droppedDuplicates.map((d) => d.kept + "←" + d.dropped).join(', '));
  }
  console.log('');

  // --- COVER SLIDE ---
  console.log('  \u2192 Rendering cover slide...');
  await renderToImage({
    format: 'carousel',
    outputPath: path.join(OUTPUT_DIR, 'carousel', '01-cover.png'),
    element: React.createElement(CoverSlide, {
      startDay: weekCover.startDay,
      endDay: weekCover.endDay,
      monthName: weekCover.monthNameUpper,
    }),
  });

  // --- EVENT SLIDES ---
  for (let i = 0; i < selected.length; i++) {
    const event = selected[i];
    console.log("  \u2192 Rendering event slide " + (i + 1) + ": " + event.title + "...");

    await renderToImage({
      format: 'carousel',
      outputPath: path.join(OUTPUT_DIR, 'carousel', "0" + (i + 2) + "-event.png"),
      element: React.createElement(EventSlide, { event, pinBase64 }),
    });
  }

  // --- CLOSING SLIDE ---
  console.log('  \u2192 Rendering closing slide...');
  const remaining = activeEvents.length - selected.length;
  await renderToImage({
    format: 'carousel',
    outputPath: path.join(OUTPUT_DIR, 'carousel', "0" + (selected.length + 2) + "-closing.png"),
    element: React.createElement(ClosingSlide, { remaining, logoBase64 }),
  });

  // --- STORIES ---
  for (let i = 0; i < selected.length; i++) {
    const event = selected[i];
    console.log("  \u2192 Rendering story " + (i + 1) + ": " + event.title + "...");

    await renderToImage({
      format: 'story',
      outputPath: path.join(OUTPUT_DIR, 'stories', "0" + (i + 1) + "-story.png"),
      element: React.createElement(EventStory, { event, pinBase64 }),
    });
  }

  await closeBrowser();
  console.log('\n\u2705 All renders complete!');
  console.log('   Check output at: ' + OUTPUT_DIR);
}

main().catch((err) => {
  console.error('\u274C Render failed:', err);
  process.exit(1);
});