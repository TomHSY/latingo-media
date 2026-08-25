/**
 * Render all Thursday lens variants for template inspection (dry-run, local PNGs only).
 * Run with: npm run render:thursday-gallery
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { activeEventsOnly, fetchThursdayWindowEvents } from '../api/client';
import { buildThursdayCaption } from '../publisher/caption';
import { closeBrowser } from '../renderer/render';
import { getParisDateLabel, getParisThuSunBounds } from '../utils/paris-time';
import { buildThursdayGallerySelections } from '../utils/thursday-selector';
import { selectSpicyEvents } from '../utils/carousel-selection';
import { loadThursdayState } from '../utils/thursday-state';
import type { MediaEvent } from '../types';
import {
  renderThursdaySelection,
} from './thursday-pipeline';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'thursday-gallery');

/** Tuesday carousel IDs for gallery selection (local preview — no extra API fetch). */
function getGalleryTuesdayIds(events: MediaEvent[]): string[] {
  const state = loadThursdayState();
  if (state.lastTuesdayCarouselEventIds.length > 0) {
    return state.lastTuesdayCarouselEventIds;
  }
  // Gallery preview: derive excludes from Thu–Sun pool (no second API call).
  const { selected } = selectSpicyEvents(events, 4);
  return selected.map((e) => e.id);
}

interface GalleryManifestVariant {
  variant: string;
  rendered: boolean;
  skipped: boolean;
  note?: string;
  headline: string;
  caption: string;
  imagePaths: string[];
  eventCount: number;
}

interface GalleryManifest {
  generatedAt: string;
  parisDate: string;
  thuSunWindow: { thursdayLabel: string; sundayLabel: string };
  totalEventsInWindow: number;
  tuesdayCarouselExcludeCount: number;
  variants: GalleryManifestVariant[];
}

async function main() {
  process.env.DRY_RUN = 'true';
  process.env.THURSDAY_LOCAL_ONLY = 'true';

  const reference = new Date();
  const parisDate = getParisDateLabel(reference);
  const thuSun = getParisThuSunBounds(reference);

  console.log('🔗 Fetching live Thu–Sun events for Thursday gallery...\n');
  const rawEvents = await fetchThursdayWindowEvents(reference);
  const events = activeEventsOnly(rawEvents);
  console.log(`  Found ${events.length} active events\n`);

  const tuesdayIds = getGalleryTuesdayIds(events);
  const entries = buildThursdayGallerySelections({
    events,
    excludeEventIds: tuesdayIds,
    reference,
  });

  if (fs.existsSync(OUTPUT_DIR)) {
    try {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true, maxRetries: 2, retryDelay: 200 });
    } catch {
      console.warn('  ⚠ Could not clear output dir (close Explorer if open) — overwriting files\n');
    }
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const manifestVariants: GalleryManifestVariant[] = [];

  console.log('🎨 Rendering all Thursday variants...\n');

  for (const entry of entries) {
    const variantDir = path.join(OUTPUT_DIR, entry.variant);
    console.log(`  → ${entry.variant}${entry.skipped ? ' (skip)' : ''}`);

    if (entry.skipped || entry.selection.skip) {
      manifestVariants.push({
        variant: entry.variant,
        rendered: false,
        skipped: true,
        note: entry.note ?? entry.selection.skipReason,
        headline: entry.selection.meta.headline,
        caption: '',
        imagePaths: [],
        eventCount: 0,
      });
      continue;
    }

    fs.mkdirSync(variantDir, { recursive: true });
    const imagePaths = await renderThursdaySelection(entry.selection, variantDir, events);
    const caption = buildThursdayCaption(entry.selection);

    manifestVariants.push({
      variant: entry.variant,
      rendered: imagePaths.length > 0,
      skipped: false,
      note: entry.note,
      headline: entry.selection.meta.headline,
      caption,
      imagePaths: imagePaths.map((p) => path.relative(path.resolve(__dirname, '..', '..'), p)),
      eventCount: entry.selection.events.length,
    });

    if (entry.note) {
      console.log(`     ⚠ ${entry.note}`);
    }
    imagePaths.forEach((p) => console.log(`     ${p}`));
  }

  await closeBrowser();

  const manifest: GalleryManifest = {
    generatedAt: new Date().toISOString(),
    parisDate,
    thuSunWindow: {
      thursdayLabel: thuSun.thursdayLabel,
      sundayLabel: thuSun.sundayLabel,
    },
    totalEventsInWindow: events.length,
    tuesdayCarouselExcludeCount: tuesdayIds.length,
    variants: manifestVariants,
  };

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

  const summaryPath = path.join(OUTPUT_DIR, 'SUMMARY.md');
  const summaryLines = [
    '# Thursday Gallery',
    '',
    `- Generated: ${manifest.generatedAt}`,
    `- Paris date: ${manifest.parisDate}`,
    `- Window: ${manifest.thuSunWindow.thursdayLabel} → ${manifest.thuSunWindow.sundayLabel}`,
    `- Events in window: ${manifest.totalEventsInWindow}`,
    '',
    '## Variants',
    '',
    ...manifestVariants.map((v) => {
      const status = v.rendered ? 'rendered' : 'skipped';
      const note = v.note ? ` — ${v.note}` : '';
      return `- **${v.variant}** (${status})${note}\n  - ${v.headline}`;
    }),
  ];
  fs.writeFileSync(summaryPath, summaryLines.join('\n') + '\n', 'utf-8');

  console.log('\n✅ Gallery complete.');
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log(`   Manifest: ${manifestPath}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      summaryLines.join('\n') + '\n',
      'utf-8'
    );
  }

  const renderedCount = manifestVariants.filter((v) => v.rendered).length;
  console.log(`\n   ${renderedCount}/${manifestVariants.length} variants rendered.`);
}

main().catch((err) => {
  console.error('❌ Thursday gallery failed:', err);
  process.exit(1);
});
