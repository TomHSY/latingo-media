/**
 * Offline test: verify same-title duplicate rows (different IDs) collapse to one,
 * keeping the higher-engagement / most-recently-created row.
 * Run with: node scripts/run-tsx.mjs src/scripts/test-dedup.ts
 */
import type { MediaEvent } from '../types';
import { selectSpicyEvents, dedupeByTitle } from '../utils/carousel-selection';

function evt(partial: Partial<MediaEvent> & { id: string; title: string }): MediaEvent {
  return {
    start_datetime: '2026-06-05T21:00:00Z',
    end_datetime: '2026-06-06T02:00:00Z',
    dance_types: [{ id: 's', slug: 'salsa', label_fr: 'Salsa' }],
    ...partial,
  } as MediaEvent;
}

// Same real event scraped/entered twice under different IDs.
// Row B was re-uploaded (cropped) more recently and has more RSVPs → should win.
const events: MediaEvent[] = [
  evt({ id: 'A', title: 'Soirée Salsa au Colisée', city: 'Bayonne', rsvp_count: 8, created_at: '2026-05-01T10:00:00Z', image_url: 'https://pub-x.r2.dev/events/old-uncropped.jpg' }),
  evt({ id: 'B', title: 'SOIRÉE  Salsa   au Colisée !', city: 'Bayonne', rsvp_count: 20, created_at: '2026-06-01T10:00:00Z', image_url: 'https://pub-x.r2.dev/events/new-cropped.jpg' }),
  evt({ id: 'C', title: 'Bachata Sensual Night', city: 'Biarritz', rsvp_count: 15, start_datetime: '2026-06-06T21:00:00Z' }),
  evt({ id: 'D', title: 'Kizomba du Port', city: 'Anglet', rsvp_count: 10, start_datetime: '2026-06-07T20:00:00Z' }),
];

let failures = 0;
function assert(cond: boolean, msg: string) {
  console.log(`${cond ? '✓' : '✗'} ${msg}`);
  if (!cond) failures++;
}

const { deduped, dropped } = dedupeByTitle(events);
assert(deduped.length === 3, `dedupeByTitle collapses 4 rows → 3 (got ${deduped.length})`);
assert(dropped.length === 1 && dropped[0].id === 'A', `drops the weaker duplicate row A (got ${dropped.map((d) => d.id).join(',') || 'none'})`);
const keptDuplicate = deduped.find((e) => e.city === 'Bayonne');
assert(!!keptDuplicate && keptDuplicate.id === 'B', `keeps cropped/high-RSVP row B`);
assert(!!keptDuplicate && keptDuplicate.image_url === 'https://pub-x.r2.dev/events/new-cropped.jpg', `kept row carries the cropped image`);

const result = selectSpicyEvents(events, 4);
const ids = result.selected.map((e) => e.id);
assert(new Set(ids).size === ids.length, `no duplicate IDs in selection (${ids.join(',')})`);
assert(!(ids.includes('A') && ids.includes('B')), `never selects both duplicate rows A and B`);
assert(result.droppedDuplicates.length === 1, `reports 1 dropped duplicate`);

console.log(failures === 0 ? '\n✅ All dedup tests passed.' : `\n❌ ${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
