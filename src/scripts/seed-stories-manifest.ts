/**
 * One-off: seed R2 manifest with events already live on Instagram (partial-run recovery).
 * Usage: npm run seed:stories-manifest
 */
import 'dotenv/config';
import {
  loadStoryManifest,
  saveStoryManifest,
  publishedEventIds,
  jpegUrlForEvent,
} from '../publisher/stories-manifest';

/** Aug 28 2026 partial run — stories 1–2 published before fatal 9004 on story 3. */
const SEED_ENTRIES = [
  {
    eventId: '48a19c7d-e89c-4512-a8a4-1608825d16b1',
    title: 'Salsa bachata et latino - Kulunka',
    mediaId: '18204370834366018',
  },
  {
    eventId: 'e65a8a0c-4361-4ea5-927d-8905a1c3ff79',
    title: 'Friday Sunset',
    mediaId: '17955662829228830',
  },
];

async function main() {
  const date = process.env.SEED_DATE ?? '2026-08-28';
  const r2Prefix = `posts/${date}/stories-daily`;
  const manifest = await loadStoryManifest(r2Prefix, date);
  const existing = publishedEventIds(manifest);

  let added = 0;
  for (const seed of SEED_ENTRIES) {
    if (existing.has(seed.eventId)) {
      console.log(`  ⏭ Already in manifest: ${seed.title}`);
      continue;
    }
    manifest.entries.push({
      eventId: seed.eventId,
      title: seed.title,
      url: jpegUrlForEvent(r2Prefix, seed.eventId),
      mediaId: seed.mediaId,
      publishedAt: new Date().toISOString(),
    });
    added++;
    console.log(`  + Seeded: ${seed.title} (${seed.eventId})`);
  }

  if (added === 0) {
    console.log('Nothing to seed.');
    return;
  }

  await saveStoryManifest(r2Prefix, manifest);
  console.log(`\n✅ Manifest updated: ${manifest.entries.length} entries for ${date}`);
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
