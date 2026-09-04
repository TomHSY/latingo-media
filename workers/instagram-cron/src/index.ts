/**
 * Reliable cron trigger for LatinGo Instagram GitHub Actions workflows.
 * Runs hourly (UTC), checks Europe/Paris, dispatches repository_dispatch when due.
 *
 * Scheduled jobs (Paris time):
 *   - stories-daily:      Mon–Fri 17:00, Sat–Sun 12:00
 *   - instagram-carousel: Tuesday 18:00
 *
 * Thursday lens (preview + publish) archived — manual via Actions when resumed.
 *
 * Manual test: POST /trigger with Authorization: Bearer <DISPATCH_SECRET>
 *   body: { "event_type": "stories-daily" }
 */

export interface Env {
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  DISPATCH_SECRET: string;
}

/** GitHub repository_dispatch event types — must match workflow `on.repository_dispatch.types`. */
export const EVENT_TYPES = {
  STORIES: 'stories-daily',
  CAROUSEL: 'instagram-carousel',
} as const;

export type DispatchEventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

interface ParisClock {
  weekday: string;
  hour: number;
  minute: number;
}

export function getParisClock(now = new Date()): ParisClock {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
  }).format(now);

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);

  return { weekday, hour, minute };
}

/** Which jobs should fire at this Paris clock (top-of-hour only). */
export function jobsDueAt(clock: ParisClock): DispatchEventType[] {
  if (clock.minute !== 0) return [];

  const jobs: DispatchEventType[] = [];
  const weekend = clock.weekday === 'Sat' || clock.weekday === 'Sun';
  const storiesHour = weekend ? 12 : 17;

  if (clock.hour === storiesHour) {
    jobs.push(EVENT_TYPES.STORIES);
  }
  if (clock.weekday === 'Tue' && clock.hour === 18) {
    jobs.push(EVENT_TYPES.CAROUSEL);
  }

  return jobs;
}

export async function dispatchGitHub(env: Env, eventType: DispatchEventType): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'latingo-instagram-cron',
    },
    body: JSON.stringify({
      event_type: eventType,
      client_payload: {
        dispatch_secret: env.DISPATCH_SECRET,
        source: 'cloudflare-cron',
        triggered_at: new Date().toISOString(),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub dispatch ${eventType} failed (${res.status}): ${body}`);
  }
}

export async function runScheduledCron(env: Env): Promise<string[]> {
  const clock = getParisClock();
  const jobs = jobsDueAt(clock);
  const dispatched: string[] = [];

  for (const eventType of jobs) {
    await dispatchGitHub(env, eventType);
    dispatched.push(eventType);
    console.log(`Dispatched ${eventType} (Paris ${clock.weekday} ${clock.hour}:${String(clock.minute).padStart(2, '0')})`);
  }

  if (dispatched.length === 0) {
    console.log(`No jobs due (Paris ${clock.weekday} ${clock.hour}:${String(clock.minute).padStart(2, '0')})`);
  }

  return dispatched;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
    await runScheduledCron(env);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      const clock = getParisClock();
      const due = jobsDueAt(clock);
      return Response.json({
        service: 'latingo-instagram-cron',
        paris: clock,
        jobs_due_now: due,
      });
    }

    if (request.method === 'POST' && url.pathname === '/trigger') {
      const auth = request.headers.get('Authorization');
      if (auth !== `Bearer ${env.DISPATCH_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
      }

      let body: { event_type?: string };
      try {
        body = (await request.json()) as { event_type?: string };
      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }

      const eventType = body.event_type as DispatchEventType | undefined;
      if (!eventType || !Object.values(EVENT_TYPES).includes(eventType)) {
        return new Response(
          `event_type required — one of: ${Object.values(EVENT_TYPES).join(', ')}`,
          { status: 400 }
        );
      }

      await dispatchGitHub(env, eventType);
      return Response.json({ ok: true, event_type: eventType });
    }

    return new Response('Not found', { status: 404 });
  },
};
