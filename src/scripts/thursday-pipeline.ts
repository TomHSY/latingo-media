/**
 * Shared Thursday lens render + optional publish pipeline.
 */
import React from 'react';
import path from 'path';
import fs from 'fs';
import {
  activeEventsOnly,
  fetchThursdayWindowEvents,
  fetchWeekendEvents,
} from '../api/client';
import { renderToImage, closeBrowser } from '../renderer/render';
import { EventSlide, ClosingSlide } from '../templates/weekly-digest';
import { LensCoverSlide } from '../templates/thursday-lens';
import { WeeklyStatsSlide, DanceDuelSlide } from '../templates/weekly-stats';
import { CrossBorderSlide } from '../templates/cross-border';
import { uploadImages } from '../publisher/upload';
import { publishCarousel, publishFeedImage } from '../publisher/instagram';
import { buildThursdayCaption } from '../publisher/caption';
import { selectSpicyEvents } from '../utils/carousel-selection';
import { parseEventStartDatetime, getParisDateLabel } from '../utils/paris-time';
import {
  selectThursdayLens,
  validateThursdaySelection,
  recordThursdayPublish,
  type ThursdaySelection,
} from '../utils/thursday-selector';
import type { MediaEvent } from '../types';
import {
  loadThursdayState,
  saveThursdayState,
  getThursdayStatePath,
} from '../utils/thursday-state';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'thursday');
const logoBase64 = fs.readFileSync(path.resolve(__dirname, '..', 'assets', 'icon-text.png')).toString('base64');
const pinBase64 = fs.readFileSync(path.resolve(__dirname, '..', '..', 'pin_large.png')).toString('base64');

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
  outDir: string
): Promise<string[]> {
  if (selection.skip) {
    return [];
  }

  const imagePaths: string[] = [];

  if (isCarouselVariant(selection.variant)) {
    const coverPath = path.join(outDir, '01-cover.png');
    await renderToImage({
      format: 'carousel',
      outputPath: coverPath,
      element: React.createElement(LensCoverSlide, {
        headline: selection.meta.headline,
        subheadline: selection.meta.subheadline,
        accentSlug: selection.meta.featuredDance,
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
        element: React.createElement(EventSlide, { event: sorted[i], pinBase64 }),
      });
      imagePaths.push(filePath);
    }

    const closingPath = path.join(outDir, `0${sorted.length + 2}-closing.png`);
    await renderToImage({
      format: 'carousel',
      outputPath: closingPath,
      element: React.createElement(ClosingSlide, {
        remaining: selection.meta.remaining,
        logoBase64,
      }),
    });
    imagePaths.push(closingPath);
  } else if (selection.variant === 'weekly-stats' && selection.meta.stats) {
    const filePath = path.join(outDir, '01-stats.png');
    await renderToImage({
      format: 'carousel',
      outputPath: filePath,
      element: React.createElement(WeeklyStatsSlide, selection.meta.stats),
    });
    imagePaths.push(filePath);
  } else if (selection.variant === 'dance-duel') {
    const filePath = path.join(outDir, '01-duel.png');
    await renderToImage({
      format: 'carousel',
      outputPath: filePath,
      element: React.createElement(DanceDuelSlide, {
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
      element: React.createElement(CrossBorderSlide, {
        frenchCount: selection.meta.frenchCount ?? 0,
        euskadiCount: selection.meta.euskadiCount ?? 0,
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
  const state = loadThursdayState();
  const selection = selectThursdayLens({
    events,
    excludeEventIds: tuesdayIds,
    state,
    reference,
  });

  console.log(`  Cycle position: ${selection.cyclePosition} → slot ${selection.slotType} / ${selection.variant}`);
  console.log(`  Ledger: ${getThursdayStatePath()}`);

  const excludeSet = new Set(tuesdayIds);
  const validationErrors = validateThursdaySelection(selection, excludeSet);
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

  const imagePaths = await renderThursdaySelection(selection, outDir);

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
