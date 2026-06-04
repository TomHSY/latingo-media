import express from 'express';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { MOCK_EVENTS } from '../mock/events';
import { CarouselSlideLayout } from '../components/layouts/CarouselSlideLayout';
import { StoryLayout } from '../components/layouts/StoryLayout';
import { DanceTypePills } from '../components/DanceTypePill';
import { EventImage } from '../components/EventImage';
import { colors, typography, fontImportUrl } from '../tokens/noche';
import { formatDateFrench, formatTimeFrench, formatDateRange } from '../utils/dates';

const app = express();
const PORT = 3456;

// Serve static assets
app.use('/assets', express.static(path.resolve(__dirname, '..', 'assets')));

// Index page — list of available previews
app.get('/', (_req, res) => {
  res.send(`
    <html>
      <head><title>LatinGo Media Engine — Preview</title>
        <style>body{font-family:system-ui;padding:40px;background:#111;color:#eee}
        a{color:#FF4E3A;font-size:18px;display:block;margin:12px 0}</style>
      </head>
      <body>
        <h1>LatinGo Media Engine — Template Preview</h1>
        <h2>Carousel Slides (1080×1350)</h2>
        <a href="/preview/carousel/cover">Cover Slide</a>
        <a href="/preview/carousel/event/0">Event Slide (mock #1)</a>
        <a href="/preview/carousel/event/1">Event Slide (mock #2)</a>
        <a href="/preview/carousel/event/2">Event Slide (mock #3)</a>
        <a href="/preview/carousel/event/3">Event Slide (mock #4)</a>
        <a href="/preview/carousel/closing">Closing Slide</a>
        <h2>Stories (1080×1920)</h2>
        <a href="/preview/story/event/0">Ce soir Story (mock #1)</a>
        <a href="/preview/story/countdown">Weekend Countdown</a>
      </body>
    </html>
  `);
});

// --- CAROUSEL COVER ---
app.get('/preview/carousel/cover', (_req, res) => {
  const events = MOCK_EVENTS;
  const cities = new Set(events.map((e) => e.city).filter(Boolean));
  const startDate = new Date('2026-05-29');
  const endDate = new Date('2026-05-31');

  const element = React.createElement(
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
        {
          style: {
            display: 'flex',
            gap: '24px',
            marginTop: '16px',
          },
        },
        React.createElement(
          'div',
          { style: { textAlign: 'center' } },
          React.createElement(
            'div',
            { style: { fontSize: '36px', fontWeight: 800, color: colors.coral } },
            String(events.length)
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
  );

  const html = '<!DOCTYPE html>' + renderToStaticMarkup(element);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// --- CAROUSEL EVENT SLIDE ---
app.get('/preview/carousel/event/:index', (req, res) => {
  const idx = parseInt(req.params.index, 10);
  // Sort by RSVP and pick top 4
  const sorted = [...MOCK_EVENTS].sort((a, b) => (b.rsvp_count || 0) - (a.rsvp_count || 0));
  const event = sorted[idx];
  if (!event) {
    res.status(404).send('Event not found');
    return;
  }

  const startDate = new Date(event.start_datetime);

  const element = React.createElement(
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
      // Day + Time badge
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
        `${formatDateFrench(startDate)} · ${formatTimeFrench(startDate)}`
      ),
      // Event image
      React.createElement(EventImage, {
        imageUrl: event.image_url,
        danceTypes: event.dance_types,
        height: '380px',
        mode: event.image_url ? 'thumbnail' : 'fallback',
      }),
      // Title
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
      // City
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
      // Dance type pills
      React.createElement(DanceTypePills, {
        danceTypes: event.dance_types,
        size: 'lg',
      }),
      // RSVP badge (if significant)
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
  );

  const html = '<!DOCTYPE html>' + renderToStaticMarkup(element);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// --- CAROUSEL CLOSING SLIDE ---
app.get('/preview/carousel/closing', (_req, res) => {
  const totalEvents = MOCK_EVENTS.length;
  const shownEvents = 4;
  const remaining = totalEvents - shownEvents;

  const element = React.createElement(
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
          style: {
            ...typography.h1,
            color: colors.text,
            marginBottom: '16px',
          },
        },
        'Toutes les soirées,'
      ),
      React.createElement(
        'h2',
        {
          style: {
            ...typography.h1,
            color: colors.text,
            marginBottom: '32px',
          },
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
  );

  const html = '<!DOCTYPE html>' + renderToStaticMarkup(element);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// --- STORY: CE SOIR ---
app.get('/preview/story/event/:index', (req, res) => {
  const idx = parseInt(req.params.index, 10);
  const event = MOCK_EVENTS[idx];
  if (!event) {
    res.status(404).send('Event not found');
    return;
  }

  const startDate = new Date(event.start_datetime);

  const element = React.createElement(
    StoryLayout,
    { showWatermark: true },
    // Background image or fallback
    React.createElement(
      'div',
      { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } },
      React.createElement(EventImage, {
        imageUrl: event.image_url,
        danceTypes: event.dance_types,
        width: '100%',
        height: '100%',
        mode: event.image_url ? 'hero' : 'fallback',
      })
    ),
    // Content overlay
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
      // CE SOIR badge
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
      // Title
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
        event.title
      ),
      // City + time
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
        `📍 ${event.city} · ${formatTimeFrench(startDate)}`
      ),
      // Pills
      React.createElement(DanceTypePills, {
        danceTypes: event.dance_types,
        size: 'lg',
        gap: '8px',
      })
    )
  );

  const html = '<!DOCTYPE html>' + renderToStaticMarkup(element);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// --- STORY: WEEKEND COUNTDOWN ---
app.get('/preview/story/countdown', (_req, res) => {
  const events = MOCK_EVENTS;
  const cities = new Set(events.map((e) => e.city).filter(Boolean));
  const styles = new Set(events.flatMap((e) => e.dance_types.map((dt) => dt.slug)));

  const element = React.createElement(
    StoryLayout,
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
          padding: '80px 48px',
          textAlign: 'center',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            color: colors.secondary,
            fontSize: '16px',
            fontWeight: 500,
            marginBottom: '32px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          },
        },
        'Ce week-end'
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
          },
        },
        React.createElement(
          'div',
          { style: { fontSize: '64px', fontWeight: 800, color: colors.coral } },
          String(events.length)
        ),
        React.createElement(
          'div',
          { style: { fontSize: '22px', color: colors.text, fontWeight: 500 } },
          'soirées'
        ),
        React.createElement(
          'div',
          {
            style: {
              marginTop: '24px',
              display: 'flex',
              gap: '32px',
            },
          },
          React.createElement(
            'div',
            { style: { textAlign: 'center' } },
            React.createElement(
              'div',
              { style: { fontSize: '32px', fontWeight: 700, color: colors.gold } },
              String(cities.size)
            ),
            React.createElement(
              'div',
              { style: { fontSize: '14px', color: colors.secondary, marginTop: '4px' } },
              'villes'
            )
          ),
          React.createElement(
            'div',
            { style: { textAlign: 'center' } },
            React.createElement(
              'div',
              { style: { fontSize: '32px', fontWeight: 700, color: colors.gold } },
              String(styles.size)
            ),
            React.createElement(
              'div',
              { style: { fontSize: '14px', color: colors.secondary, marginTop: '4px' } },
              'styles'
            )
          )
        )
      )
    )
  );

  const html = '<!DOCTYPE html>' + renderToStaticMarkup(element);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`\n🎨 LatinGo Media Engine — Preview Server`);
  console.log(`   http://localhost:${PORT}\n`);
  console.log(`   Templates rendered with mock data (10 events)\n`);
});
