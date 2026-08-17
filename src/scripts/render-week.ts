/**
 * Render carousel + stories for a specific week.
 * Usage: npx tsx --use-system-ca src/scripts/render-week.ts 2026-06-01 [--upload]
 * Output: output/week-2026-06-01/carousel/ + output/week-2026-06-01/stories/
 * --upload: also upload to Google Drive after rendering
 */
import React from 'react';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { renderToImage, closeBrowser } from '../renderer/render';
import { fetchEvents, activeEventsOnly } from '../api/client';
import { CoverSlide, EventSlide, ClosingSlide } from '../templates/weekly-digest';
import { EventStory } from '../templates/ce-soir';
import { generateCarouselCaption } from '../publisher/caption';
import { uploadToDrive } from '../publisher/gdrive';
import { getParisCalendarWeekCover, getParisWeekdayIndex, parseEventStartDatetime } from '../utils/paris-time';
import { selectSpicyEvents } from '../utils';

const logoBase64 = fs.readFileSync(path.resolve(__dirname, '..', 'assets', 'icon-text.png')).toString('base64');
const pinBase64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'pin_large.png')).toString('base64');

async function main() {
  // Parse week start date from CLI arg (default: this Monday)
  const arg = process.argv[2];
  let weekStart: Date;

  if (arg) {
    weekStart = new Date(arg + 'T00:00:00');
    if (isNaN(weekStart.getTime())) {
      console.error('❌ Invalid date. Usage: npx tsx --use-system-ca src/scripts/render-week.ts 2026-06-01');
      process.exit(1);
    }
  } else {
    // Default to this Monday
    weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7); // exclusive end (Mon to Mon)

  const folderName = `week-${weekStart.toISOString().slice(0, 10)}`;
  const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', folderName);

  console.log(`📅 Rendering week: ${weekStart.toISOString().slice(0, 10)} → ${weekEnd.toISOString().slice(0, 10)}`);
  console.log(`📁 Output folder: output/${folderName}/\n`);

  console.log('🔗 Fetching events from api.latingo.fr...\n');

  const events = await fetchEvents({
    date_from: weekStart.toISOString(),
    date_to: weekEnd.toISOString(),
    sort_by: 'date_asc',
    include_past: true,
  });

  console.log(`  Found ${events.length} events\n`);

  if (events.length === 0) {
    console.log('❌ No events found for this week. Cannot render.');
    process.exit(1);
  }

  const activeEvents = activeEventsOnly(events);
  const { selected, recurringPenalizedCount, recurringCandidates, droppedDuplicates } = selectSpicyEvents(activeEvents, 4);
  // Present slides and caption in chronological order.
  selected.sort((a, b) => parseEventStartDatetime(a.start_datetime).getTime() - parseEventStartDatetime(b.start_datetime).getTime());
  const weekCover = getParisCalendarWeekCover(weekStart);

  console.log(`  Selected ${selected.length} events for carousel:`);
  selected.forEach((e) => console.log(`    • ${e.title} (${e.city})`));
  if (recurringPenalizedCount > 0) {
    console.log('  Applied recurring down-rank heuristic to selection candidates.');
  }
  if (recurringCandidates.length > 0) {
    console.log('  Likely recurring candidates detected:');
    recurringCandidates.forEach((e) => console.log(`    - ${e.title} (${e.city || 'unknown'})`));
  }
  if (droppedDuplicates.length > 0) {
    console.log(`  Collapsed ${droppedDuplicates.length} duplicate row(s): kept/dropped ${droppedDuplicates.map((d) => `${d.kept}←${d.dropped}`).join(', ')}`);
  }
  console.log('');

  // --- COVER SLIDE ---
  console.log('  → Rendering cover slide...');
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
    console.log(`  → Rendering event slide ${i + 1}: ${event.title}...`);

    await renderToImage({
      format: 'carousel',
      outputPath: path.join(OUTPUT_DIR, 'carousel', `0${i + 2}-event.png`),
      element: React.createElement(EventSlide, { event, pinBase64 }),
    });
  }

  // --- CLOSING SLIDE ---
  console.log('  → Rendering closing slide...');
  const remaining = activeEvents.length - selected.length;
  await renderToImage({
    format: 'carousel',
    outputPath: path.join(OUTPUT_DIR, 'carousel', `0${selected.length + 2}-closing.png`),
    element: React.createElement(ClosingSlide, { remaining, logoBase64 }),
  });

  // --- STORIES (all events, grouped by day) ---
  const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const dayCounters: Record<string, number> = {};

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const eventDate = parseEventStartDatetime(event.start_datetime);
    const dayName = DAYS_FR[getParisWeekdayIndex(eventDate)];
    dayCounters[dayName] = (dayCounters[dayName] || 0) + 1;
    const dayIdx = String(dayCounters[dayName]).padStart(2, '0');
    const safeCity = (event.city || 'unknown').replace(/[^a-zA-Z0-9À-ÿ\-]/g, '_');
    const filename = `${dayName}-${dayIdx}-${safeCity}.png`;
    console.log(`  → Rendering story [${i + 1}/${events.length}] ${filename}...`);

    await renderToImage({
      format: 'story',
      outputPath: path.join(OUTPUT_DIR, 'stories', filename),
      element: React.createElement(EventStory, { event, pinBase64 }),
    });
  }

  await closeBrowser();

  // --- CAPTION ---
  console.log('\n  ✍️ Generating caption with GPT-4o-mini...');
  const caption = await generateCarouselCaption(selected, weekCover.monday, weekCover.sunday);
  const captionPath = path.join(OUTPUT_DIR, 'caption.txt');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(captionPath, caption, 'utf-8');

  console.log(`\n✅ All renders complete!`);
  console.log(`   Carousel: output/${folderName}/carousel/ (${selected.length + 2} slides)`);
  console.log(`   Stories:  output/${folderName}/stories/ (${events.length} stories)`);
  console.log(`   Caption:  output/${folderName}/caption.txt`);
  console.log(`\n--- Caption ---\n`);
  console.log(caption);

  // --- GOOGLE DRIVE UPLOAD ---
  if (process.argv.includes('--upload')) {
    console.log('\n☁️  Uploading to Google Drive...\n');
    const driveUrl = await uploadToDrive(OUTPUT_DIR, folderName);
    console.log(`\n✅ Uploaded! ${driveUrl}`);
  }
}

main().catch((err) => {
  console.error('❌ Render failed:', err);
  process.exit(1);
});
