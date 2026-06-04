/**
 * Facebook Page publisher.
 * Publishes multi-photo album posts via graph.facebook.com.
 */
import 'dotenv/config';

const BASE_URL = 'https://graph.facebook.com/v25.0';
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
const PAGE_ID = process.env.FB_PAGE_ID!;

async function apiPost(path: string, body: Record<string, string>): Promise<any> {
  const params = new URLSearchParams({ ...body, access_token: PAGE_TOKEN });
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: params,
  });
  const json = (await res.json()) as any;
  if (!res.ok || json.error) {
    throw new Error(`Facebook API error: ${JSON.stringify(json.error ?? json)}`);
  }
  return json;
}

/**
 * Upload a photo (by URL) as unpublished.
 * Returns the media_fbid.
 */
async function uploadUnpublishedPhoto(imageUrl: string): Promise<string> {
  const data = await apiPost(`/${PAGE_ID}/photos`, {
    url: imageUrl,
    published: 'false',
  });
  return data.id as string;
}

/**
 * Publish a multi-photo post on the Facebook Page.
 * Returns the post ID.
 */
export async function publishFacebookAlbum(imageUrls: string[], message: string): Promise<string> {
  console.log(`  Uploading ${imageUrls.length} photos (unpublished)...`);
  const photoIds: string[] = [];
  for (const url of imageUrls) {
    const id = await uploadUnpublishedPhoto(url);
    photoIds.push(id);
    console.log(`  ✓ Photo: ${id}`);
  }

  console.log('  Creating multi-photo post...');
  const attachedMedia: Record<string, string> = {};
  photoIds.forEach((id, i) => {
    attachedMedia[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id });
  });

  const data = await apiPost(`/${PAGE_ID}/feed`, {
    message,
    ...attachedMedia,
  });

  const postId = data.id as string;
  console.log(`  ✓ Published! Post ID: ${postId}`);
  return postId;
}
