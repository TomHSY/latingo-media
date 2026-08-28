/**
 * Per-event Instagram story publish manifest stored in R2.
 * Tracks which events were successfully posted (not just rendered/uploaded).
 */
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Bucket, getPublicUrl } from './r2';

export interface StoryManifestEntry {
  eventId: string;
  title: string;
  url: string;
  mediaId: string;
  publishedAt: string;
}

export interface StoryManifest {
  date: string;
  entries: StoryManifestEntry[];
}

export function manifestKeyForPrefix(r2Prefix: string): string {
  return `${r2Prefix.replace(/\/$/, '')}/manifest.json`;
}

export function publishedEventIds(manifest: StoryManifest): Set<string> {
  return new Set(manifest.entries.map((e) => e.eventId));
}

export async function loadStoryManifest(r2Prefix: string, date: string): Promise<StoryManifest> {
  const key = manifestKeyForPrefix(r2Prefix);
  try {
    const response = await getR2Client().send(
      new GetObjectCommand({ Bucket: getR2Bucket(), Key: key })
    );
    const body = await response.Body?.transformToString();
    if (!body) return { date, entries: [] };
    const parsed = JSON.parse(body) as StoryManifest;
    return { date: parsed.date ?? date, entries: parsed.entries ?? [] };
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
    const message = err instanceof Error ? err.message : String(err);
    if (code === 'NoSuchKey' || message.includes('NoSuchKey') || message.includes('NotFound')) {
      return { date, entries: [] };
    }
    throw err;
  }
}

export async function saveStoryManifest(r2Prefix: string, manifest: StoryManifest): Promise<void> {
  const key = manifestKeyForPrefix(r2Prefix);
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      Body: JSON.stringify(manifest, null, 2),
      ContentType: 'application/json',
    })
  );
}

/** Public JPEG URL if the render artifact exists in R2. */
export function jpegUrlForEvent(r2Prefix: string, eventId: string): string {
  return getPublicUrl(`${r2Prefix}/${eventId}.jpg`);
}
