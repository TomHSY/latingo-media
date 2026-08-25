/**
 * Shared Thursday lens render + optional publish pipeline.
 */
import React from 'react';
import path from 'path';
import {
  activeEventsOnly,
  fetchThursdayWindowEvents,
  fetchWeekendEvents,
} from '../api/client';
import { type AreaSlug, getAreaForEvent } from '../config/areas';
import { renderToImage, closeBrowser } from '../renderer/render';
import {
  CoverA2Magazine,
  CoverA2RegionFocus,
  ThursdayEventCard,
  ThursdayManifestoClosing,
  CrossBorderC3PollSplit,
  DuelD1FloorSplit,
  DuelD5Radar,
} from '../templates/thursday-lens';
import { getDanceType } from '../tokens/dance-types';
import { uploadImages } from '../publisher/upload';
import { publishCarousel, publishFeedImage } from '../publisher/instagram';
import { buildThursdayCaption } from '../publisher/caption';
import { selectSpicyEvents } from '../utils/carousel-selection';
import { parseEventStartDatetime, getParisDateLabel } from '../utils/paris-time';
import {
  selectThursdayLens,
  validateThursdaySelection,
  recordThursdayPublish,
  RARE_DANCES,
  type ThursdaySelection,
} from '../utils/thursday-selector';
import type { MediaEvent } from '../types';
import {
  loadThursdayState,
  saveThursdayState,
  getThursdayStatePath,
} from '../utils/thursday-state';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'thursday');
const PROOF_LINE = 'Jeudi – Dimanche';

const REGION_ACCENTS: Record<AreaSlug, string> = {
  bab: 'salsa',
  landes: 'bachata',
  bearn: 'kizomba',
  euskadi: 'zouk',
};

const RADAR_DANCE_SLUGS = ['salsa', 'bachata', 'kizomba', 'zouk', 'tango-argentin'] as const;

export interface ThursdayPipelineResult {
  selection: ThursdaySelection;
  imagePaths: string[];
  imageUrls: string[];
  caption: string;
  skipped: boolean;
}

export function isCarouselVariant(variant: ThursdaySelection['variant']): boolean {
  return variant === 'dance-spotlight' || variant === 'autres-danses' || variant === 'area-focus';
}

function countByDance(events: MediaEvent[], slug: string): number {
  return events.filter((e) => (e.dance_types || []).some((d) => d.slug === slug)).length;
}

function pickHeroImage(events: MediaEvent[], area: AreaSlug): string | null {
  const areaEvents = events.filter((e) => getAreaForEvent(e) === area);
  const withImg = areaEvents.filter((e) => e.image_url);
  return (withImg[0] ?? areaEvents[0])?.image_url ?? null;
}

function buildRadarStyles(events: MediaEvent[]) {
  return RADAR_DANCE_SLUGS.map((slug) => ({
    slug,
    label: getDanceType(slug).label_fr,
    count: countByDance(events, slug),
  })).filter((s) => s.count > 0);
}

function coverAccent(selection: ThursdaySelection): string | undefined {
  if (selection.meta.featuredArea) {
    return REGION_ACCENTS[selection.meta.featuredArea];
  }
  const dance = selection.meta.featuredDance;
  if (dance && dance !== 'autres-danses') {
    return dance;
  }
  return 'salsa';
}

function highlightDanceSlugForEvent(
  selection: ThursdaySelection,
  event: MediaEvent
): string | undefined {
  if (selection.variant === 'dance-spotlight' && selection.meta.featuredDance) {
    return selection.meta.featuredDance;
  }
  if (selection.variant === 'autres-danses') {
    return RARE_DANCES.find((slug) => (event.dance_types || []).some((d) => d.slug === slug));
  }
  return undefined;
}

export async function getTuesdayCarouselIds(): Promise<string[]> {
  const state = loadThursdayState();
  if (state.lastTuesdayCarouselEventIds.length > 0) {
    return state.lastTuesdayCarouselEventIds;
  }

  try {
    const events = activeEventsOnly(await fetchWeekendEvents());
    const { selected } = selectSpicyEvents(events, 4);
    return selected.map((e) => e.id);
  } catch {
    return [];
  }
}

export async function renderThursdaySelection(
  selection: ThursdaySelection,
  outDir: string,
  pool: MediaEvent[] = []
): Promise<string[]> {
  if (selection.skip) {
    return [];
  }

  const imagePaths: string[] = [];

  if (isCarouselVariant(selection.variant)) {
    const Cover =
      selection.variant === 'area-focus' ? CoverA2RegionFocus : CoverA2Magazine;

    const coverPath = path.join(outDir, '01-cover.png');
    await renderToImage({
      format: 'carousel',
      outputPath: coverPath,
      element: React.createElement(Cover, {
        headline: selection.meta.headline,
        proofLine: PROOF_LINE,
        accentSlug: coverAccent(selection),
        subheadline: selection.meta.subheadline,
      }),
    });
    imagePaths.push(coverPath);

    const sorted = [...selection.events].sort(
      (a, b) =>
        parseEventStartDatetime(a.start_datetime).getTime() -
        parseEventStartDatetime(b.start_datetime).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const filePath = path.join(outDir, `0${i + 2}-event.png`);
      await renderToImage({
        format: 'carousel',
        outputPath: filePath,
        element: React.createElement(ThursdayEventCard, {
          event: sorted[i],
          index: i,
          total: sorted.length,
          highlightDanceSlug: highlightDanceSlugForEvent(selection, sorted[i]),
        }),
      });
      imagePaths.push(filePath);
    }

    const closingPath = path.join(outDir, `0${sorted.length + 2}-closing.png`);
    await renderToImage({
      format: 'carousel',
      outputPath: closingPath,
      element: React.createElement(ThursdayManifestoClosing, {
        remaining: selection.meta.remaining,
      }),
    });
    imagePaths.push(closingPath);
  } else if (selection.variant === 'weekly-stats') {
    const filePath = path.join(outDir, '01-radar.png');
    await renderToImage({
      format: 'carousel',
      outputPath: filePath,
      element: React.createElement(DuelD5Radar, { styles: buildRadarStyles(pool) }),
    });
    imagePaths.push(filePath);
  } else if (selection.variant === 'dance-duel') {
    const filePath = path.join(outDir, '01-duel.png');
    await renderToImage({
      format: 'carousel',
      outputPath: filePath,
      element: React.createElement(DuelD1FloorSplit, {
        salsaCount: selection.meta.salsaCount ?? 0,
        bachataCount: selection.meta.bachataCount ?? 0,
      }),
    });
    imagePaths.push(filePath);
  } else if (selection.variant === 'cross-border') {
    const filePath = path.join(outDir, '01-cross-border.png');
    await renderToImage({
      format: 'carousel',
      outputPath: filePath,
      element: React.createElement(CrossBorderC3PollSplit, {
        frenchCount: selection.meta.frenchCount ?? 0,
        euskadiCount: selection.meta.euskadiCount ?? 0,
        frenchImage: pickHeroImage(pool, 'bab'),
        euskadiImage: pickHeroImage(pool, 'euskadi'),
      }),
    });
    imagePaths.push(filePath);
  }

  return imagePaths;
}

export async function runThursdayPipeline(options: {
  publish?: boolean;
  reference?: Date;
}): Promise<ThursdayPipelineResult> {
  const reference = options.reference ?? new Date();
  const label = getParisDateLabel(reference);

  console.log('🔗 Fetching Thu–Sun events for Thursday lens...\n');
  const useMock = process.env.THURSDAY_MOCK === 'true';
  let events: MediaEvent[];
  if (useMock) {
    const { getMockThursdayWindowEvents } = await import('../mock/thursday-events');
    events = getMockThursdayWindowEvents(reference);
    console.log('  🧪 THURSDAY_MOCK=true — using offline mock events\n');
  } else {
    const rawEvents = await fetchThursdayWindowEvents(reference);
    events = activeEventsOnly(rawEvents);
  }
  console.log(`  Found ${events.length} active events in Thu–Sun window\n`);

  const tuesdayIds = await getTuesdayCarouselIds();
  const tuesdaySet = new Set(tuesdayIds);
  const pool = events.filter((e) => !tuesdaySet.has(e.id));

  const state = loadThursdayState();
  const selection = selectThursdayLens({
    events,
    excludeEventIds: tuesdayIds,
    state,
    reference,
  });

  console.log(`  Cycle position: ${selection.cyclePosition} → slot ${selection.slotType} / ${selection.variant}`);
  console.log(`  Ledger: ${getThursdayStatePath()}`);

  const validationErrors = validateThursdaySelection(selection, tuesdaySet);
  if (validationErrors.length > 0) {
    for (const err of validationErrors) {
      console.warn(`  ⚠ Validation: ${err}`);
    }
  }

  if (selection.skip) {
    console.log(`\n⏭ Skipping Thursday lens: ${selection.skipReason ?? 'thin week'}`);
    return {
      selection,
      imagePaths: [],
      imageUrls: [],
      caption: '',
      skipped: true,
    };
  }

  console.log(`  Headline: ${selection.meta.headline}`);
  selection.events.forEach((e) => console.log(`    • ${e.title} (${e.city})`));
  console.log('');

  const outDir = path.join(OUTPUT_DIR, label);
  console.log('🎨 Rendering Thursday lens...\n');

  const imagePaths = await renderThursdaySelection(selection, outDir, pool);

  await closeBrowser();
  console.log('\n✅ Renders complete.\n');
  console.log('   Local files:');
  imagePaths.forEach((p) => console.log(`     ${p}`));

  const skipUpload =
    process.env.THURSDAY_LOCAL_ONLY === 'true' ||
    process.env.THURSDAY_MOCK === 'true' ||
    !process.env.R2_PUBLIC_URL;

  let imageUrls: string[] = [];
  if (skipUpload) {
    console.log('\n⏭ Skipping R2 upload (local preview).\n');
  } else {
    const prefix = `posts/${label}/thursday`;
    console.log('☁️  Uploading to R2...\n');
    imageUrls = await uploadImages(imagePaths, prefix);
    imageUrls.forEach((u) => console.log(`     ${u}`));
  }

  const caption = buildThursdayCaption(selection);
  console.log('\n📝 Caption preview:\n');
  console.log(caption);
  console.log('');

  if (process.env.DRY_RUN === 'true' || !options.publish) {
    console.log('🧪 Preview mode — skipping Instagram publish.');
    return { selection, imagePaths, imageUrls, caption, skipped: false };
  }

  console.log('📲 Publishing to Instagram...\n');

  if (isCarouselVariant(selection.variant)) {
    await publishCarousel(imageUrls, caption);
  } else {
    await publishFeedImage(imageUrls[0], caption);
  }

  const nextState = recordThursdayPublish(state, selection, tuesdayIds, reference);
  saveThursdayState(nextState);
  console.log(`\n✅ Published! Ledger updated (cycle → ${nextState.cyclePosition}).`);

  return { selection, imagePaths, imageUrls, caption, skipped: false };
}
