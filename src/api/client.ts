import 'dotenv/config';
import type { MediaEvent } from '../types';
import { getParisWeekendBounds, getParisThuSunBounds } from '../utils/paris-time';

const API_BASE = 'https://api.latingo.fr';

let cachedToken: string | null = null;

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

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  return cachedToken!;
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
  const token = await getToken();

  const searchParams = new URLSearchParams();
  if (params.date_from) searchParams.set('date_from', params.date_from);
  if (params.date_to) searchParams.set('date_to', params.date_to);
  if (params.city) searchParams.set('city', params.city);
  if (params.dance_type) searchParams.set('dance_type', params.dance_type);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.include_past) searchParams.set('include_past', 'true');

  const url = `${API_BASE}/events?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${await res.text()}`);
  }

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
  const token = await getToken();
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
