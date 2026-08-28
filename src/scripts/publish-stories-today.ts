/**
 * Render and publish one Instagram story per event happening today (Europe/Paris).
 * Run with: npm run publish:stories-today
 *
 * Resume: manifest.json in R2 tracks successfully posted events.
 * A partial run (e.g. 2/9 posted) resumes the remaining 7 on next run without duplicating.
 */
import React from 'react';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { renderToImage, closeBrowser } from '../renderer/render';
import { EventStory } from '../templates/ce-soir';
import {
  uploadImage,
  listR2Keys,
  hasR2JpegForEvent,
  verifyPublicUrl,
} from '../publisher/upload';
import { publishStory } from '../publisher/instagram';
import {
  loadStoryManifest,
  saveStoryManifest,
  publishedEventIds,
  jpegUrlForEvent,
} from '../publisher/stories-manifest';
import { fetchTodayStoryEvents, logStoryEventAudit } from '../utils/story-events';
import type { MediaEvent } from '../types';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'stories-today');
const pinBase64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'pin_large.png')).toString('base64');

const STORY_PUBLISH_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PreparedStory {
  event: MediaEvent;
  url: string;
}

async function prepareStoryUrl(
  event: MediaEvent,
  r2Prefix: string,
  existingKeys: string[],
  singleEventId: string | undefined,
  index: number,
  total: number
): Promise<string> {
  const reuseExisting =
    !singleEventId && hasR2JpegForEvent(existingKeys, r2Prefix, event.id);

  if (reuseExisting) {
    const url = jpegUrlForEvent(r2Prefix, event.id);
    console.log(`  → Reusing R2 JPEG ${index + 1}/${total}: ${event.title} (${event.id})`);
    await verifyPublicUrl(url, event.id);
    console.log(`  ✓ Cached → ${url}`);
    return url;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const fileBase = singleEventId ? `${event.id}-v${Date.now()}` : event.id;
  const filePath = path.join(OUTPUT_DIR, `${fileBase}.png`);

  console.log(`  → Rendering story ${index + 1}/${total}: ${event.title} (${event.id})...`);
  await renderToImage({
    format: 'story',
    outputPath: filePath,
    element: React.createElement(EventStory, { event, pinBase64 }),
  });

  const r2Key = `${r2Prefix}/${path.basename(filePath, '.png')}.jpg`;
  const url = await uploadImage(filePath, r2Key);
  console.log(`  ✓ Uploaded → ${url}`);
  return url;
}

async function main() {
  const singleEventId = process.env.STORY_EVENT_ID?.trim();
  const forceAll = process.env.FORCE_PUBLISH === 'stories';

  console.log('ℹ Story links: clickable link stickers are not available via the current Instagram Graph API publish flow.');
  console.log('  Stories are published as image-only media until official API support exists.\n');

  const { label, events, audit, excluded } = await fetchTodayStoryEvents({
    includeIsoDateFallback: true,
  });

  console.log(`📅 Stories for today (Europe/Paris): ${label}\n`);

  const r2Prefix = `posts/${label}/stories-daily`;
  let manifest = await loadStoryManifest(r2Prefix, label);
  const alreadyPublished = publishedEventIds(manifest);
  const existingKeys = await listR2Keys(r2Prefix);

  if (events.length === 0) {
    console.log('  No events today — nothing to publish.');
    if (excluded.length > 0) {
      console.log(`  (${excluded.length} event(s) in padded query but excluded by Paris-day filter)`);
    }
    return;
  }

  let eventsToPublish = events;
  if (singleEventId) {
    eventsToPublish = events.filter((e) => e.id === singleEventId);
    if (eventsToPublish.length === 0) {
      console.log(`❌ Event ${singleEventId} not in today's story list.`);
      process.exit(1);
    }
    console.log(`  Republishing single story: ${eventsToPublish[0].title}\n`);
  } else if (!forceAll) {
    eventsToPublish = events.filter((e) => !alreadyPublished.has(e.id));
    if (alreadyPublished.size > 0) {
      console.log(`  ℹ ${alreadyPublished.size} event(s) already in manifest — resuming ${eventsToPublish.length} remaining.\n`);
    }
    if (eventsToPublish.length === 0) {
      console.log(`⏭ All ${events.length} story/stories already published for ${label} (manifest).`);
      return;
    }
  } else {
    console.log('  ⚠ FORCE_PUBLISH=stories — attempting all events (may duplicate on Instagram).\n');
  }

  console.log(`  Selected ${eventsToPublish.length} event(s) for stories:\n`);
  audit
    .filter((a) => eventsToPublish.some((e) => e.id === a.event.id))
    .forEach((a) => {
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

  const prepared: PreparedStory[] = [];
  for (let i = 0; i < eventsToPublish.length; i++) {
    const event = eventsToPublish[i];
    const url = await prepareStoryUrl(
      event,
      r2Prefix,
      existingKeys,
      singleEventId,
      i,
      eventsToPublish.length
    );
    prepared.push({ event, url });
  }

  await closeBrowser();

  if (process.env.DRY_RUN === 'true') {
    console.log('\n🧪 DRY_RUN=true — skipping Instagram publish.\n');
    prepared.forEach(({ url }) => console.log(`     ${url}`));
    console.log('\n✅ Dry run complete.');
    return;
  }

  console.log('\n📲 Publishing stories to Instagram...\n');

  const failures: { eventId: string; title: string; error: string }[] = [];
  let successCount = 0;

  for (let i = 0; i < prepared.length; i++) {
    const { event, url } = prepared[i];
    console.log(`  → Story ${i + 1}/${prepared.length}: ${event.title} (${event.id})...`);
    try {
      const mediaId = await publishStory(url);
      manifest.entries.push({
        eventId: event.id,
        title: event.title,
        url,
        mediaId,
        publishedAt: new Date().toISOString(),
      });
      await saveStoryManifest(r2Prefix, manifest);
      successCount++;
      console.log(`  ✓ Manifest updated (${manifest.entries.length} total for ${label})`);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Failed: ${event.title} — ${error}`);
      failures.push({ eventId: event.id, title: event.title, error });
    }
    if (i < prepared.length - 1) {
      await sleep(STORY_PUBLISH_DELAY_MS);
    }
  }

  const totalPublished = manifest.entries.length;
  console.log(`\n📊 This run: ${successCount}/${prepared.length} published. Day total: ${totalPublished}/${events.length}.`);

  if (failures.length > 0) {
    console.error('\n❌ Failed events (re-run will resume these only):');
    failures.forEach((f) => console.error(`   • ${f.title} (${f.eventId})`));
    process.exit(1);
  }

  console.log(`\n✅ Published ${successCount} story/stories.`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
