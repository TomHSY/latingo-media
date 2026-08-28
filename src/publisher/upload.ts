/**
 * Upload images to Cloudflare R2 and return public URLs.
 * Converts PNG to JPEG before uploading (Meta requires JPEG).
 */
import { PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { getR2Client, getR2Bucket, getPublicUrl } from './r2';

const MIN_JPEG_BYTES = 10_000;
const STORY_MIN_WIDTH = 600;
const STORY_MIN_HEIGHT = 600;

/** JPEG magic bytes FF D8 FF */
function isJpegBuffer(buf: Buffer): boolean {
  return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

/** Validate JPEG before Meta fetch — catches empty/corrupt renders early. */
export async function validateJpegBuffer(jpeg: Buffer, label: string): Promise<void> {
  if (!isJpegBuffer(jpeg)) {
    throw new Error(`${label}: not a valid JPEG (bad magic bytes, ${jpeg.length} bytes)`);
  }
  if (jpeg.length < MIN_JPEG_BYTES) {
    throw new Error(`${label}: JPEG too small (${jpeg.length} bytes, min ${MIN_JPEG_BYTES})`);
  }
  const meta = await sharp(jpeg).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`${label}: could not read JPEG dimensions`);
  }
  if (meta.width < STORY_MIN_WIDTH || meta.height < STORY_MIN_HEIGHT) {
    throw new Error(
      `${label}: JPEG dimensions ${meta.width}x${meta.height} below minimum ${STORY_MIN_WIDTH}x${STORY_MIN_HEIGHT}`
    );
  }
}

/** Confirm the public R2 URL is fetchable before calling Meta. */
export async function verifyPublicUrl(url: string, label: string): Promise<void> {
  const res = await fetch(url, { method: 'HEAD' });
  if (!res.ok) {
    throw new Error(`${label}: public URL not reachable (${res.status} ${res.statusText}) — ${url}`);
  }
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('image/jpeg') && !ct.includes('image/jpg')) {
    throw new Error(`${label}: unexpected Content-Type "${ct}" — ${url}`);
  }
}

/**
 * Convert a PNG file to JPEG buffer with validation.
 */
async function toJpeg(filePath: string): Promise<Buffer> {
  const jpeg = await sharp(fs.readFileSync(filePath)).jpeg({ quality: 92 }).toBuffer();
  await validateJpegBuffer(jpeg, path.basename(filePath));
  return jpeg;
}

/**
 * Upload a single PNG file as JPEG to R2.
 * Returns the public URL.
 */
export async function uploadImage(filePath: string, key: string, skipVerify = false): Promise<string> {
  const jpeg = await toJpeg(filePath);
  const r2Key = key.endsWith('.jpg') ? key : key.replace(/\.png$/, '.jpg');

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: r2Key,
      Body: jpeg,
      ContentType: 'image/jpeg',
    })
  );

  const url = getPublicUrl(r2Key);
  if (!skipVerify) {
    // Brief pause so CDN edge can serve the object before Meta fetches it.
    await new Promise((r) => setTimeout(r, 3000));
    await verifyPublicUrl(url, r2Key);
  }
  return url;
}

/**
 * Upload multiple PNG files to R2 under a given prefix.
 * Returns an array of public URLs in the same order.
 */
export async function uploadImages(filePaths: string[], prefix: string): Promise<string[]> {
  const urls: string[] = [];
  for (const filePath of filePaths) {
    const filename = path.basename(filePath, '.png') + '.jpg';
    const key = `${prefix}/${filename}`;
    const url = await uploadImage(filePath, key);
    urls.push(url);
    console.log(`  ✓ Uploaded ${filename} → ${url}`);
  }
  return urls;
}

/** List object keys under an R2 prefix. */
export async function listR2Keys(prefix: string): Promise<string[]> {
  const normalized = prefix.replace(/\/$/, '');
  const keys: string[] = [];
  let continuationToken: string | undefined;

  try {
    do {
      const response = await getR2Client().send(
        new ListObjectsV2Command({
          Bucket: getR2Bucket(),
          Prefix: `${normalized}/`,
          ContinuationToken: continuationToken,
        })
      );

      for (const item of response.Contents ?? []) {
        if (item.Key) keys.push(item.Key);
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `R2 list failed for prefix "${normalized}/". Check R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME and bucket permissions. Original error: ${message}`
    );
  }

  return keys;
}

/** True when a render artifact exists at posts/{date}/stories-daily/{eventId}.jpg */
export function hasR2JpegForEvent(existingKeys: string[], r2Prefix: string, eventId: string): boolean {
  const suffix = `${r2Prefix}/${eventId}.jpg`;
  return existingKeys.some((k) => k === suffix || k.endsWith(`/${eventId}.jpg`));
}
