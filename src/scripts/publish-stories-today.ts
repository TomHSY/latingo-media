/**
 * Render and publish one Instagram story per event happening today (Europe/Paris).
 * Run with: npm run publish:stories-today
 */
import React from 'react';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { renderToImage, closeBrowser } from '../renderer/render';
import { EventStory } from '../templates/ce-soir';
import { uploadImage } from '../publisher/upload';
import { publishStory } from '../publisher/instagram';
import { fetchTodayStoryEvents, logStoryEventAudit } from '../utils/story-events';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'stories-today');
const pinBase64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'pin_large.png')).toString('base64');

const STORY_PUBLISH_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { label, events, audit, excluded } = await fetchTodayStoryEvents({
    includeIsoDateFallback: true,
  });

  console.log(`📅 Stories for today (Europe/Paris): ${label}\n`);

  if (events.length === 0) {
    console.log('  No events today — nothing to publish.');
    if (excluded.length > 0) {
      console.log(`  (${excluded.length} event(s) in padded query but excluded by Paris-day filter)`);
    }
    return;
  }

  console.log(`  Selected ${events.length} event(s) for stories:\n`);
  audit.forEach((a) => {
    if (a.includeReason === 'iso_fallback') {
      console.log(`  ⚠ ISO-date fallback: ${a.event.title}`);
    }
    logStoryEventAudit(a);
  });

  if (excluded.length > 0) {
    console.log(`\n  Excluded (${excluded.length}):\n`);
    excluded.forEach((a) => {
      console.log(`    ✗ ${a.event.title} — Paris ${a.parisDate} ${a.parisTime} (${a.event.start_datetime})`);
    });
  }
  console.log('');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const r2Prefix = `posts/${label}/stories-daily`;
  const storyUrls: string[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const safeName = `${event.id}.png`;
    const filePath = path.join(OUTPUT_DIR, safeName);

    console.log(`  → Rendering story ${i + 1}/${events.length}: ${event.title}...`);
    await renderToImage({
      format: 'story',
      outputPath: filePath,
      element: React.createElement(EventStory, { event, pinBase64 }),
    });

    const r2Key = `${r2Prefix}/${path.basename(filePath, '.png')}.jpg`;
    const url = await uploadImage(filePath, r2Key);
    storyUrls.push(url);
    console.log(`  ✓ Uploaded → ${url}`);
  }

  await closeBrowser();

  if (process.env.DRY_RUN === 'true') {
    console.log('\n🧪 DRY_RUN=true — skipping Instagram publish.\n');
    storyUrls.forEach((u) => console.log(`     ${u}`));
    console.log('\n✅ Dry run complete.');
    return;
  }

  console.log('\n📲 Publishing stories to Instagram...\n');
  for (let i = 0; i < storyUrls.length; i++) {
    console.log(`  → Story ${i + 1}/${storyUrls.length}...`);
    await publishStory(storyUrls[i]);
    if (i < storyUrls.length - 1) {
      await sleep(STORY_PUBLISH_DELAY_MS);
    }
  }

  console.log(`\n✅ Published ${storyUrls.length} story/stories.`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
