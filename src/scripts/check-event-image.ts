/**
 * Debug: print image_url for an event by ID.
 * Usage: npx tsx src/scripts/check-event-image.ts <event-id>
 */
import 'dotenv/config';
import { fetchEvents } from '../api/client';
import { getParisDayBounds } from '../utils/paris-time';

const id = process.argv[2];
if (!id) {
  console.error('Usage: check-event-image.ts <event-id>');
  process.exit(1);
}

async function main() {
  const { from, to } = getParisDayBounds();
  const events = await fetchEvents({ date_from: from, date_to: to, sort_by: 'date_asc' });
  const event = events.find((e) => e.id === id);
  if (!event) {
    console.log('Event not found in today bounds, searching ±7 days...');
    const weekFrom = new Date(new Date(from).getTime() - 7 * 86400000).toISOString();
    const weekTo = new Date(new Date(to).getTime() + 7 * 86400000).toISOString();
    const wider = await fetchEvents({ date_from: weekFrom, date_to: weekTo, sort_by: 'date_asc' });
    const found = wider.find((e) => e.id === id);
    if (!found) {
      console.error('Event not found');
      process.exit(1);
    }
    await print(found);
    return;
  }
  await print(event);
}

async function print(event: { id: string; title: string; image_url?: string | null }) {
  console.log('Title:', event.title);
  console.log('ID:', event.id);
  console.log('image_url:', event.image_url ?? '(none)');
  if (event.image_url) {
    const res = await fetch(event.image_url, { method: 'HEAD' });
    console.log('HEAD status:', res.status);
    console.log('etag:', res.headers.get('etag'));
    console.log('last-modified:', res.headers.get('last-modified'));
    console.log('content-length:', res.headers.get('content-length'));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
