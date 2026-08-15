/**
 * Render and publish one Instagram story for a cancelled event.
 * Run with: STORY_EVENT_ID=<uuid> npm run publish:cancelled-story
 */
import React from 'react';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { renderToImage, closeBrowser } from '../renderer/render';
import { CancelledStory } from '../templates/annulee';
import { fetchEventById } from '../api/client';
import { uploadImage } from '../publisher/upload';
import { publishStory } from '../publisher/instagram';
import { getParisDateLabel, parseEventStartDatetime } from '../utils/paris-time';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'stories-cancelled');
const pinBase64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'pin_large.png')).toString('base64');

async function main() {
  const eventId = process.env.STORY_EVENT_ID?.trim();
  if (!eventId) {
    console.error('❌ STORY_EVENT_ID is required.');
    process.exit(1);
  }

  console.log(`📅 Fetching cancelled event ${eventId}...\n`);
  const event = await fetchEventById(eventId);
  const preview = process.env.PREVIEW === 'true';

  if (!preview && (event.status ?? 'active') !== 'cancelled') {
    console.error(`❌ Event "${event.title}" is not cancelled (status=${event.status ?? 'active'}).`);
    console.error('   Use PREVIEW=true to render the template without publishing.');
    process.exit(1);
  }

  if (preview && (event.status ?? 'active') !== 'cancelled') {
    console.log(`  ⚠ PREVIEW=true — rendering as cancelled despite status=${event.status ?? 'active'}\n`);
    event.status = 'cancelled';
  }

  const label = getParisDateLabel(parseEventStartDatetime(event.start_datetime));
  const r2Prefix = `posts/${label}/stories-cancelled`;
  const fileBase = `${event.id}-v${Date.now()}`;
  const filePath = path.join(OUTPUT_DIR, `${fileBase}.png`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`  → Rendering cancelled story: ${event.title}...`);
  await renderToImage({
    format: 'story',
    outputPath: filePath,
    element: React.createElement(CancelledStory, { event, pinBase64 }),
  });
  console.log(`  ✓ Rendered → ${filePath}`);

  await closeBrowser();

  if (preview) {
    console.log('\n✅ Preview render complete.');
    return;
  }

  const r2Key = `${r2Prefix}/${fileBase}.jpg`;
  const url = await uploadImage(filePath, r2Key);
  console.log(`  ✓ Uploaded → ${url}`);

  if (process.env.DRY_RUN === 'true') {
    console.log('\n🧪 DRY_RUN=true — skipping Instagram publish.');
    console.log(`     Local PNG: ${filePath}`);
    console.log(`     R2 URL: ${url}`);
    console.log('\n✅ Dry run complete.');
    return;
  }

  console.log('\n📲 Publishing cancelled story to Instagram...\n');
  await publishStory(url);
  console.log('\n✅ Cancelled story published.');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
