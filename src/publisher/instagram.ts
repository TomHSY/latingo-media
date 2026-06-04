/**
 * Instagram Graph API publisher.
 * Uses graph.instagram.com (Instagram API with Instagram Login).
 */
import 'dotenv/config';

const BASE_URL = 'https://graph.instagram.com/v22.0';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const USER_ID = process.env.INSTAGRAM_USER_ID!;

async function apiPost(path: string, params: Record<string, string>): Promise<any> {
  const body = new URLSearchParams({ ...params, access_token: ACCESS_TOKEN });
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body,
  });
  const json = await res.json() as any;
  if (!res.ok || json.error) {
    throw new Error(`Instagram API error: ${JSON.stringify(json.error ?? json)}`);
  }
  return json;
}

/**
 * Create a single carousel item container.
 * Returns the container ID.
 */
async function createItemContainer(imageUrl: string): Promise<string> {
  const data = await apiPost(`/${USER_ID}/media`, {
    image_url: imageUrl,
    is_carousel_item: 'true',
  });
  return data.id as string;
}

/**
 * Create the carousel container from item container IDs.
 * Returns the carousel container ID.
 */
async function createCarouselContainer(
  itemIds: string[],
  caption: string
): Promise<string> {
  const data = await apiPost(`/${USER_ID}/media`, {
    media_type: 'CAROUSEL',
    children: itemIds.join(','),
    caption,
  });
  return data.id as string;
}

/**
 * Publish a media container (carousel or single image).
 * Returns the published media ID.
 */
async function publishContainer(containerId: string): Promise<string> {
  const data = await apiPost(`/${USER_ID}/media_publish`, {
    creation_id: containerId,
  });
  return data.id as string;
}

/**
 * Publish a carousel post to Instagram.
 * Returns the published media ID.
 */
export async function publishCarousel(imageUrls: string[], caption: string): Promise<string> {
  console.log(`  Creating ${imageUrls.length} item containers...`);
  const itemIds: string[] = [];
  for (const url of imageUrls) {
    const id = await createItemContainer(url);
    itemIds.push(id);
    console.log(`  ✓ Item container: ${id}`);
  }

  console.log('  Creating carousel container...');
  const carouselId = await createCarouselContainer(itemIds, caption);
  console.log(`  ✓ Carousel container: ${carouselId}`);

  console.log('  Publishing carousel...');
  const mediaId = await publishContainer(carouselId);
  console.log(`  ✓ Published! Media ID: ${mediaId}`);

  return mediaId;
}

/**
 * Publish a single image story to Instagram.
 * Returns the published media ID.
 */
export async function publishStory(imageUrl: string): Promise<string> {
  console.log('  Creating story container...');
  const data = await apiPost(`/${USER_ID}/media`, {
    image_url: imageUrl,
    media_type: 'STORIES',
  });
  const containerId = data.id as string;
  console.log(`  ✓ Story container: ${containerId}`);

  console.log('  Publishing story...');
  const mediaId = await publishContainer(containerId);
  console.log(`  ✓ Published! Media ID: ${mediaId}`);

  return mediaId;
}
