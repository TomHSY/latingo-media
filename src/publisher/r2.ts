/**
 * Shared Cloudflare R2 client and URL helpers.
 */
import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

let client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export function getR2Bucket(): string {
  return process.env.R2_BUCKET_NAME!;
}

export function getPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, '');
  return `${base}/${key.replace(/^\//, '')}`;
}
