import 'dotenv/config';
import type { MediaEvent } from '../types';
import { getParisWeekendBounds, getParisThuSunBounds } from '../utils/paris-time';

const API_BASE = 'https://api.latingo.fr';
const API_RETRY_ATTEMPTS = 4;
const API_RETRY_BASE_MS = 5000;

let cachedToken: string | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableHttpStatus(status: number): boolean {
  return status >= 500 && status < 600;
}

class RetryableApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableApiError';
  }
}

function isRetryableFetchError(err: unknown): boolean {
  return err instanceof RetryableApiError || err instanceof TypeError;
}

function responseErrorSnippet(body: string, maxLen = 200): string {
  const trimmed = body.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    const titleMatch = trimmed.match(/<title>([^<]+)<\/title>/i);
    return titleMatch?.[1]?.trim() ?? 'HTML error page';
  }
  return trimmed.length > maxLen ? `${trimmed.slice(0, maxLen)}…` : trimmed;
}

async function withApiRetries<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= API_RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryableFetchError(err) || attempt === API_RETRY_ATTEMPTS) {
        throw err;
      }

      lastError = err instanceof Error ? err : new Error(String(err));
      const backoff = API_RETRY_BASE_MS * attempt;
      const detail = lastError.message.slice(0, 120);
      console.warn(
        `⏳ ${label} transient error (${detail}), retry ${attempt}/${API_RETRY_ATTEMPTS - 1} in ${backoff / 1000}s...`
      );
      await sleep(backoff);
    }
  }

  throw lastError ?? new Error(`${label} failed after ${API_RETRY_ATTEMPTS} attempts`);
}

async function readApiResponse(res: Response, label: string): Promise<Response> {
  if (res.ok) return res;

  const body = await res.text();
  const snippet = responseErrorSnippet(body);
  const message = `${label}: ${res.status} ${snippet}`;

  if (isRetryableHttpStatus(res.status)) {
    throw new RetryableApiError(message);
  }

  throw new Error(message);
}

/**
 * Authenticate and get a Bearer token.
 */
async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
  }

  const token = await withApiRetries('API auth', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    await readApiResponse(res, 'Auth failed');
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  });

  cachedToken = token;
  return token;
}

async function authorizedGet(label: string, url: string): Promise<Response> {
  const token = await getToken();
  return withApiRetries(label, async () => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return readApiResponse(res, 'API error');
  });
}

/**
 * Fetch events from the LatinGo API.
 */
export async function fetchEvents(params: {
  date_from?: string;
  date_to?: string;
  city?: string;
  dance_type?: string;
  sort_by?: string;
  include_past?: boolean;
}): Promise<MediaEvent[]> {
  const searchParams = new URLSearchParams();
  if (params.date_from) searchParams.set('date_from', params.date_from);
  if (params.date_to) searchParams.set('date_to', params.date_to);
  if (params.city) searchParams.set('city', params.city);
  if (params.dance_type) searchParams.set('dance_type', params.dance_type);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.include_past) searchParams.set('include_past', 'true');

  const url = `${API_BASE}/events?${searchParams.toString()}`;
  const res = await authorizedGet('API events', url);
  const data = await res.json();
  // API may return { events: [...] } or directly [...]
  return Array.isArray(data) ? data : data.events ?? data.items ?? [];
}

/**
 * Fetch this weekend's events (Friday to Sunday, Europe/Paris).
 */
export async function fetchWeekendEvents(): Promise<MediaEvent[]> {
  const { from, to } = getParisWeekendBounds();

  return fetchEvents({
    date_from: from,
    date_to: to,
    sort_by: 'date_asc',
  });
}

/**
 * Fetch Thu–Sun events for the Thursday lens window (Europe/Paris).
 */
export async function fetchThursdayWindowEvents(reference = new Date()): Promise<MediaEvent[]> {
  const { from, to } = getParisThuSunBounds(reference);

  return fetchEvents({
    date_from: from,
    date_to: to,
    sort_by: 'date_asc',
  });
}

/**
 * Keep only active events for carousel selection and counting.
 */
export function activeEventsOnly(events: MediaEvent[]): MediaEvent[] {
  return events.filter((event) => (event.status ?? 'active') !== 'cancelled');
}

/**
 * Keep only cancelled events for dedicated cancellation views.
 */
export function cancelledEventsOnly(events: MediaEvent[]): MediaEvent[] {
  return events.filter((event) => event.status === 'cancelled');
}

/**
 * Fetch a single event by ID.
 */
export async function fetchEventById(eventId: string): Promise<MediaEvent> {
  const res = await authorizedGet('API event', `${API_BASE}/events/${eventId}`);
  return res.json();
}
