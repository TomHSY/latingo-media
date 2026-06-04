/**
 * Test render script — generates actual PNG files from mock data.
 * Run with: npm run render:test
 */
import React from 'react';
import path from 'path';
import { renderToImage, closeBrowser } from '../renderer/render';
import { MOCK_EVENTS } from '../mock/events';
import { CarouselSlideLayout } from '../components/layouts/CarouselSlideLayout';
import { StoryLayout } from '../components/layouts/StoryLayout';
import { DanceTypePills } from '../components/DanceTypePill';
import { EventImage } from '../components/EventImage';
import { colors, typography } from '../tokens/noche';
import { formatDateFrench, formatTimeFrench, formatDateRange } from '../utils/dates';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'test');

async function main() {
  console.log('🎨 LatinGo Media Engine — Test Render');
  console.log(`   Output: ${OUTPUT_DIR}\n`);

  const events = [...MOCK_EVENTS].sort((a, b) => (b.rsvp_count || 0) - (a.rsvp_count || 0));
  const topEvents = events.slice(0, 4);
  const cities = new Set(MOCK_EVENTS.map((e) => e.city).filter(Boolean));
  const startDate = new Date('2026-05-29');
  const endDate = new Date('2026-05-31');

  // --- COVER SLIDE ---
  console.log('  → Rendering cover slide...');
  await renderToImage({
    format: 'carousel',
    outputPath: path.join(OUTPUT_DIR, 'carousel', '01-cover.png'),
    element: React.createElement(
      CarouselSlideLayout,
      { showWatermark: true },
      React.createElement(
        'div',
        {
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 48px',
            textAlign: 'center',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              color: colors.gold,
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '20px',
            },
          },
          formatDateRange(startDate, endDate)
        ),
        React.createElement(
          'h1',
          {
            style: {
              ...typography.hero,
              fontSize: '42px',
              lineHeight: '50px',
              color: colors.text,
              marginBottom: '32px',
            },
          },
          'Où danser ce\nweek-end ?'
        ),
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '24px', marginTop: '16px' } },
          React.createElement(
            'div',
            { style: { textAlign: 'center' } },
            React.createElement(
              'div',
              { style: { fontSize: '36px', fontWeight: 800, color: colors.coral } },
              String(MOCK_EVENTS.length)
            ),
            React.createElement(
              'div',
              { style: { fontSize: '14px', color: colors.secondary } },
              'soirées'
            )
          ),
          React.createElement(
            'div',
            { style: { textAlign: 'center' } },
            React.createElement(
              'div',
              { style: { fontSize: '36px', fontWeight: 800, color: colors.coral } },
              String(cities.size)
            ),
            React.createElement(
              'div',
              { style: { fontSize: '14px', color: colors.secondary } },
              'villes'
            )
          )
        )
      )
    ),
  });

  // --- EVENT SLIDES ---
  for (let i = 0; i < topEvents.length; i++) {
    const event = topEvents[i];
    const startDt = new Date(event.start_datetime);
    console.log(`  → Rendering event slide ${i + 1}: ${event.title}...`);

    await renderToImage({
      format: 'carousel',
      outputPath: path.join(OUTPUT_DIR, 'carousel', `0${i + 2}-event-${event.id}.png`),
      element: React.createElement(
        CarouselSlideLayout,
        { showWatermark: true },
        React.createElement(
          'div',
          {
            style: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '48px',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                color: colors.gold,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '16px',
              },
            },
            `${formatDateFrench(startDt)} · ${formatTimeFrench(startDt)}`
          ),
          React.createElement(EventImage, {
            imageUrl: event.image_url,
            danceTypes: event.dance_types,
            height: '380px',
            mode: event.image_url ? 'thumbnail' : 'fallback',
          }),
          React.createElement(
            'h2',
            {
              style: {
                ...typography.h1,
                color: colors.text,
                marginTop: '24px',
                marginBottom: '12px',
              },
            },
            event.title
          ),
          React.createElement(
            'div',
            {
              style: {
                fontSize: '16px',
                color: colors.secondary,
                marginBottom: '16px',
              },
            },
            `📍 ${event.city}`
          ),
          React.createElement(DanceTypePills, {
            danceTypes: event.dance_types,
            size: 'lg',
          }),
          event.rsvp_count && event.rsvp_count >= 10
            ? React.createElement(
                'div',
                {
                  style: {
                    marginTop: '20px',
                    color: colors.gold,
                    fontSize: '14px',
                    fontWeight: 600,
                  },
                },
                `🔥 ${event.rsvp_count} personnes intéressées`
              )
            : null
        )
      ),
    });
  }

  // --- CLOSING SLIDE ---
  console.log('  → Rendering closing slide...');
  const remaining = MOCK_EVENTS.length - 4;
  await renderToImage({
    format: 'carousel',
    outputPath: path.join(OUTPUT_DIR, 'carousel', '06-closing.png'),
    element: React.createElement(
      CarouselSlideLayout,
      { showWatermark: true },
      React.createElement(
        'div',
        {
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 48px',
            textAlign: 'center',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              fontSize: '20px',
              color: colors.secondary,
              marginBottom: '24px',
            },
          },
          `…et ${remaining} autres soirées ce week-end`
        ),
        React.createElement(
          'h2',
          {
            style: { ...typography.h1, color: colors.text, marginBottom: '16px' },
          },
          'Toutes les soirées,'
        ),
        React.createElement(
          'h2',
          {
            style: { ...typography.h1, color: colors.text, marginBottom: '32px' },
          },
          'filtrées par style et par ville'
        ),
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: colors.coral,
              color: colors.white,
              fontWeight: 700,
              fontSize: '18px',
              padding: '14px 32px',
              borderRadius: '30px',
            },
          },
          '📲 LatinGo — lien en bio'
        )
      )
    ),
  });

  // --- STORY: CE SOIR ---
  console.log('  → Rendering "Ce soir" story...');
  const storyEvent = topEvents[0];
  const storyDate = new Date(storyEvent.start_datetime);
  await renderToImage({
    format: 'story',
    outputPath: path.join(OUTPUT_DIR, 'stories', '01-ce-soir.png'),
    element: React.createElement(
      StoryLayout,
      { showWatermark: true },
      React.createElement(
        'div',
        { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } },
        React.createElement(EventImage, {
          imageUrl: storyEvent.image_url,
          danceTypes: storyEvent.dance_types,
          width: '100%',
          height: '100%',
          mode: storyEvent.image_url ? 'hero' : 'fallback',
        })
      ),
      React.createElement(
        'div',
        {
          style: {
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px 48px 100px',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'inline-block',
              backgroundColor: colors.gold,
              color: colors.black,
              fontWeight: 800,
              fontSize: '14px',
              padding: '6px 16px',
              borderRadius: '6px',
              marginBottom: '24px',
              alignSelf: 'flex-start',
            },
          },
          'CE SOIR'
        ),
        React.createElement(
          'h1',
          {
            style: {
              ...typography.hero,
              fontSize: '38px',
              lineHeight: '46px',
              color: colors.text,
              marginBottom: '16px',
            },
          },
          storyEvent.title
        ),
        React.createElement(
          'div',
          {
            style: {
              fontSize: '18px',
              color: colors.text,
              marginBottom: '20px',
              opacity: 0.9,
            },
          },
          `📍 ${storyEvent.city} · ${formatTimeFrench(storyDate)}`
        ),
        React.createElement(DanceTypePills, {
          danceTypes: storyEvent.dance_types,
          size: 'lg',
          gap: '8px',
        })
      )
    ),
  });

  await closeBrowser();
  console.log('\n✅ All renders complete!');
  console.log(`   Check output at: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('❌ Render failed:', err);
  process.exit(1);
});
