/**
 * Upload images to Cloudflare R2 and return public URLs.
 * Converts PNG to JPEG before uploading (Meta requires JPEG).
 */
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!.replace(/\/$/, '');

/**
 * Convert a PNG file to JPEG buffer.
 */
async function toJpeg(filePath: string): Promise<Buffer> {
  return sharp(fs.readFileSync(filePath)).jpeg({ quality: 92 }).toBuffer();
}

/**
 * Upload a single PNG file as JPEG to R2.
 * Returns the public URL.
 */
export async function uploadImage(filePath: string, key: string): Promise<string> {
  const jpeg = await toJpeg(filePath);
  const r2Key = key.endsWith('.jpg') ? key : key.replace(/\.png$/, '.jpg');

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: r2Key,
      Body: jpeg,
      ContentType: 'image/jpeg',
    })
  );

  return `${PUBLIC_URL}/${r2Key}`;
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

/** List object keys under an R2 prefix (for publish idempotency). */
export async function listR2Keys(prefix: string): Promise<string[]> {
  const normalized = prefix.replace(/\/$/, '');
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `${normalized}/`,
        ContinuationToken: continuationToken,
      })
    );

    for (const item of response.Contents ?? []) {
      if (item.Key) keys.push(item.Key);
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}
