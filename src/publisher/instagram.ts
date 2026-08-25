/**
 * Instagram Graph API publisher.
 * Uses graph.instagram.com (Instagram API with Instagram Login).
 */
import 'dotenv/config';

const BASE_URL = 'https://graph.instagram.com/v22.0';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const USER_ID = process.env.INSTAGRAM_USER_ID!;

/** Poll interval while Instagram processes uploaded media. */
const CONTAINER_POLL_INTERVAL_MS = 2000;
/** Max wait before giving up (Meta recommends up to ~5 min for video). */
const CONTAINER_MAX_WAIT_MS = 120_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function apiGet(path: string, params: Record<string, string> = {}): Promise<any> {
  const qs = new URLSearchParams({ ...params, access_token: ACCESS_TOKEN });
  const res = await fetch(`${BASE_URL}${path}?${qs}`);
  const json = await res.json() as any;
  if (!res.ok || json.error) {
    throw new Error(`Instagram API error: ${JSON.stringify(json.error ?? json)}`);
  }
  return json;
}

/**
 * Poll container until Instagram finishes processing the remote image/video.
 * @see https://developers.facebook.com/docs/instagram-platform/content-publishing
 */
async function waitForContainerReady(containerId: string): Promise<void> {
  const deadline = Date.now() + CONTAINER_MAX_WAIT_MS;
  let loggedWait = false;

  while (Date.now() < deadline) {
    const data = await apiGet(`/${containerId}`, { fields: 'status_code' });
    const status = data.status_code as string;

    if (status === 'FINISHED') {
      if (loggedWait) console.log('  ✓ Container ready');
      return;
    }
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`Instagram container ${containerId} status: ${status}`);
    }

    if (!loggedWait) {
      console.log(`  ⏳ Waiting for container processing (${status})...`);
      loggedWait = true;
    }
    await sleep(CONTAINER_POLL_INTERVAL_MS);
  }

  throw new Error(
    `Instagram container ${containerId} not ready after ${CONTAINER_MAX_WAIT_MS / 1000}s`
  );
}

function isTransientPublishError(message: string): boolean {
  return (
    message.includes('9007') ||
    message.includes('2207027') ||
    message.includes('An unknown error has occurred') ||
    message.includes('"code":1') ||
    message.includes('not ready') ||
    message.includes('Media ID is not available')
  );
}

/** Retry a Graph API call on transient/unknown Meta errors with linear backoff. */
async function withRetries<T>(label: string, fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!isTransientPublishError(message) || attempt === maxAttempts) throw err;
      const backoff = CONTAINER_POLL_INTERVAL_MS * attempt;
      console.log(`  ⏳ ${label} transient error, retry ${attempt}/${maxAttempts - 1} in ${backoff / 1000}s...`);
      await sleep(backoff);
    }
  }
  throw new Error(`${label} failed after ${maxAttempts} attempts`);
}

/**
 * Create a single carousel item container.
 * Returns the container ID.
 */
async function createItemContainer(imageUrl: string): Promise<string> {
  return withRetries('carousel item container', async () => {
    const data = await apiPost(`/${USER_ID}/media`, {
      image_url: imageUrl,
      is_carousel_item: 'true',
    });
    return data.id as string;
  });
}

/**
 * Create the carousel container from item container IDs.
 * Returns the carousel container ID.
 */
async function createCarouselContainer(
  itemIds: string[],
  caption: string
): Promise<string> {
  return withRetries('carousel container', async () => {
    const data = await apiPost(`/${USER_ID}/media`, {
      media_type: 'CAROUSEL',
      children: itemIds.join(','),
      caption,
    });
    return data.id as string;
  });
}

/**
 * Publish a media container (carousel or single image).
 * Returns the published media ID.
 */
async function publishContainer(containerId: string): Promise<string> {
  await waitForContainerReady(containerId);

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await apiPost(`/${USER_ID}/media_publish`, {
        creation_id: containerId,
      });
      return data.id as string;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!isTransientPublishError(message) || attempt === maxAttempts) throw err;
      console.log(`  ⏳ Publish retry ${attempt}/${maxAttempts - 1}...`);
      await sleep(CONTAINER_POLL_INTERVAL_MS);
      await waitForContainerReady(containerId);
    }
  }

  throw new Error('Instagram publish failed after retries');
}

/**
 * Publish a single feed image to Instagram.
 * Returns the published media ID.
 */
export async function publishFeedImage(imageUrl: string, caption: string): Promise<string> {
  console.log('  Creating feed image container...');
  const data = await withRetries('feed image container', () =>
    apiPost(`/${USER_ID}/media`, {
      image_url: imageUrl,
    })
  );
  const containerId = data.id as string;
  console.log(`  ✓ Feed container: ${containerId}`);

  console.log('  Publishing feed image...');
  const mediaId = await publishContainer(containerId);
  console.log(`  ✓ Published! Media ID: ${mediaId}`);

  return mediaId;
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
    await waitForContainerReady(id);
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
  const data = await withRetries('story container', () =>
    apiPost(`/${USER_ID}/media`, {
      image_url: imageUrl,
      media_type: 'STORIES',
    })
  );
  const containerId = data.id as string;
  console.log(`  ✓ Story container: ${containerId}`);

  console.log('  Publishing story...');
  const mediaId = await publishContainer(containerId);
  console.log(`  ✓ Published! Media ID: ${mediaId}`);

  return mediaId;
}
