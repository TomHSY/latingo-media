/**
 * Full pipeline: render → upload to R2 → publish to Instagram.
 * Run with: npm run publish:real
 */
import React from 'react';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { renderToImage, closeBrowser } from '../renderer/render';
import { fetchWeekendEvents, fetchEvents, activeEventsOnly } from '../api/client';
import { CoverSlide, EventSlide, ClosingSlide } from '../templates/weekly-digest';
import { EventStory } from '../templates/ce-soir';
import { uploadImages, listR2Keys } from '../publisher/upload';
import { publishCarousel, publishStory } from '../publisher/instagram';
import { publishFacebookAlbum } from '../publisher/facebook';
import { generateCarouselCaption } from '../publisher/caption';
import { getParisCalendarWeekCover, getParisDateLabel } from '../utils/paris-time';
import { selectSpicyEvents } from '../utils';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'real');
const logoBase64 = fs.readFileSync(path.resolve(__dirname, '..', 'assets', 'icon-text.png')).toString('base64');
const pinBase64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'pin_large.png')).toString('base64');

async function main() {
  console.log('🔗 Fetching real events from api.latingo.fr...\n');

  const label = getParisDateLabel();
  const r2Prefix = `posts/${label}/carousel`;
  const force = process.env.FORCE_PUBLISH === 'carousel';
  const existingKeys = await listR2Keys(r2Prefix);
  if (!force && existingKeys.length > 0) {
    console.log(
      `⏭ Carousel already published for ${label} (${existingKeys.length} file(s) in R2 at ${r2Prefix}/). Skipping.`
    );
    return;
  }

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

  console.log(`  Found ${events.length} events\n`);

  if (events.length === 0) {
    console.log('❌ No events found. Cannot publish.');
    process.exit(1);
  }

  const activeEvents = activeEventsOnly(events);
  const { selected, recurringPenalizedCount, recurringCandidates, droppedDuplicates } = selectSpicyEvents(activeEvents, 4);
  const weekCover = getParisCalendarWeekCover();

  console.log(`  Selected ${selected.length} events:`);
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

  // ── STEP 1: Render ────────────────────────────────────────────────
  console.log('🎨 Step 1: Rendering slides...\n');

  const carouselDir = path.join(OUTPUT_DIR, 'carousel');
  const storiesDir = path.join(OUTPUT_DIR, 'stories');

  // Cover
  const coverPath = path.join(carouselDir, '01-cover.png');
  console.log('  → Rendering cover...');
  await renderToImage({
    format: 'carousel',
    outputPath: coverPath,
    element: React.createElement(CoverSlide, {
      startDay: weekCover.startDay,
      endDay: weekCover.endDay,
      monthName: weekCover.monthNameUpper,
    }),
  });

  // Event slides
  const eventPaths: string[] = [];
  for (let i = 0; i < selected.length; i++) {
    const event = selected[i];
    const filePath = path.join(carouselDir, `0${i + 2}-event.png`);
    console.log(`  → Rendering event ${i + 1}: ${event.title}...`);
    await renderToImage({
      format: 'carousel',
      outputPath: filePath,
      element: React.createElement(EventSlide, { event, pinBase64 }),
    });
    eventPaths.push(filePath);
  }

  // Closing slide
  const closingPath = path.join(carouselDir, `0${selected.length + 2}-closing.png`);
  console.log('  → Rendering closing slide...');
  await renderToImage({
    format: 'carousel',
    outputPath: closingPath,
    element: React.createElement(ClosingSlide, { remaining: activeEvents.length - selected.length, logoBase64 }),
  });

  const carouselOnly = process.env.CAROUSEL_ONLY === 'true';
  const storyPaths: string[] = [];

  if (!carouselOnly) {
    for (let i = 0; i < selected.length; i++) {
      const event = selected[i];
      const filePath = path.join(storiesDir, `0${i + 1}-story.png`);
      console.log(`  → Rendering story ${i + 1}: ${event.title}...`);
      await renderToImage({
        format: 'story',
        outputPath: filePath,
        element: React.createElement(EventStory, { event, pinBase64 }),
      });
      storyPaths.push(filePath);
    }
  }

  await closeBrowser();
  console.log('\n✅ Renders complete.\n');

  // ── STEP 2: Upload ────────────────────────────────────────────────
  const prefix = `posts/${label}`;

  console.log('☁️  Step 2: Uploading to R2...\n');

  const carouselFiles = [coverPath, ...eventPaths, closingPath];
  console.log(`  Uploading ${carouselFiles.length} carousel slides...`);
  const carouselUrls = await uploadImages(carouselFiles, `${prefix}/carousel`);

  let storyUrls: string[] = [];
  if (storyPaths.length > 0) {
    console.log(`\n  Uploading ${storyPaths.length} stories...`);
    storyUrls = await uploadImages(storyPaths, `${prefix}/stories`);
  }

  console.log('\n✅ Uploads complete.\n');

  if (process.env.DRY_RUN === 'true') {
    console.log('🧪 DRY_RUN=true — skipping caption and publish.\n');
    console.log('   Carousel URLs:');
    carouselUrls.forEach((u) => console.log(`     ${u}`));
    if (storyUrls.length > 0) {
      console.log('   Story URLs:');
      storyUrls.forEach((u) => console.log(`     ${u}`));
    }
    console.log('\n✅ Dry run complete. Set DRY_RUN=false to publish for real.');
    return;
  }

  // ── STEP 3: Publish ───────────────────────────────────────────────
  console.log('✍️  Step 3: Generating caption with GPT-4o-mini...\n');
  const caption = await generateCarouselCaption(selected, weekCover.monday, weekCover.sunday);
  console.log('  Caption preview:\n');
  console.log(caption);
  console.log('');

  // ── STEP 4: Publish to Instagram ──────────────────────────────────
  console.log('📲 Step 4: Publishing to Instagram...\n');

  console.log('  Publishing carousel...');
  const carouselMediaId = await publishCarousel(carouselUrls, caption);

  if (storyUrls.length > 0) {
    console.log('\n  Publishing stories...');
    for (let i = 0; i < storyUrls.length; i++) {
      console.log(`  → Story ${i + 1}/${storyUrls.length}...`);
      await publishStory(storyUrls[i]);
    }
  }

  console.log(`\n  ✓ Instagram done — Carousel: ${carouselMediaId}`);

  // ── STEP 5: Publish to Facebook ───────────────────────────────────
  if (process.env.FB_PAGE_ACCESS_TOKEN && process.env.FB_PAGE_ID) {
    console.log('\n📘 Step 5: Publishing to Facebook Page...\n');
    const fbPostId = await publishFacebookAlbum(carouselUrls, caption);
    console.log(`\n  ✓ Facebook done — Post: ${fbPostId}`);
  } else {
    console.log('\n  ⏭ Skipping Facebook (FB_PAGE_ACCESS_TOKEN / FB_PAGE_ID not set)');
  }

  console.log('\n✅ All published!');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
