/**
 * Cross-border concept explorations (C1–C4).
 */
import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors, typography } from '../../tokens/noche';
import { formatDateFrench, formatTimeFrench } from '../../utils/dates';
import { parseEventStartDatetime } from '../../utils/paris-time';
import { cacheBustUrl } from '../../utils/urls';
import type { MediaEvent } from '../../types';

export interface CrossBorderCounts {
  frenchCount: number;
  euskadiCount: number;
}

/** C1 — Passport stamp (no emoji flags) */
export function CrossBorderC1Passport({ frenchCount, euskadiCount }: CrossBorderCounts) {
  const stamp = (label: string, count: number, accent: string) =>
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          border: `3px dashed ${accent}`,
          borderRadius: '20px',
          padding: '48px 28px',
          textAlign: 'center' as const,
          background: 'rgba(28,28,36,0.6)',
          transform: label === 'FR' ? 'rotate(-2deg)' : 'rotate(2deg)',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '28px',
            letterSpacing: '6px',
            color: accent,
            marginBottom: '20px',
          },
        },
        label
      ),
      React.createElement(
        'div',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '96px',
            lineHeight: '96px',
            color: colors.text,
          },
        },
        String(count)
      ),
      React.createElement(
        'div',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 600,
            fontSize: '24px',
            color: colors.secondary,
            marginTop: '12px',
            textTransform: 'uppercase' as const,
            letterSpacing: '2px',
          },
        },
        'soirées'
      )
    );

  return React.createElement(
    CarouselSlideLayout,
    { showWatermark: false },
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px 56px',
          background: colors.bg,
        },
      },
      React.createElement(
        'h1',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '52px',
            lineHeight: '58px',
            textAlign: 'center',
            color: colors.text,
            marginBottom: '16px',
          },
        },
        "L'autre côté de la frontière"
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontSize: '26px',
            color: colors.secondary,
            textAlign: 'center',
            marginBottom: '56px',
          },
        },
        'Ce week-end · SBK des deux côtés'
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '36px', marginBottom: '56px' } },
        stamp('FR', frenchCount, colors.coral),
        stamp('EUSKADI', euskadiCount, colors.gold)
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 600,
            fontSize: '28px',
            textAlign: 'center',
            color: colors.text,
          },
        },
        "Passe de l'autre côté sur l'app"
      )
    )
  );
}

export interface ItineraryStop {
  city: string;
  side: 'FR' | 'ES';
}

/** C2 — Weekend itinerary (cities as journey) */
export function CrossBorderC2Itinerary({
  frenchCount,
  euskadiCount,
  stops,
}: CrossBorderCounts & { stops: ItineraryStop[] }) {
  return React.createElement(
    CarouselSlideLayout,
    { showWatermark: false },
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 56px 80px',
          background: colors.bg,
        },
      },
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 700,
            fontSize: '22px',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
            color: colors.coral,
            marginBottom: '20px',
          },
        },
        'Itinéraire week-end'
      ),
      React.createElement(
        'h1',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '56px',
            lineHeight: '62px',
            color: colors.text,
            marginBottom: '48px',
          },
        },
        'Une frontière.\nDeux scènes.'
      ),
      React.createElement(
        'div',
        { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' } },
        ...stops.slice(0, 5).map((stop, i) =>
          React.createElement(
            'div',
            {
              key: `${stop.city}-${i}`,
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '22px 0',
                borderBottom: i < Math.min(stops.length, 5) - 1 ? `1px solid ${colors.border}` : 'none',
              },
            },
            React.createElement(
              'div',
              {
                style: {
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: stop.side === 'FR' ? colors.coral : colors.gold,
                  color: colors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: typography.fontFamily,
                  fontWeight: 800,
                  fontSize: '18px',
                },
              },
              stop.side
            ),
            React.createElement(
              'span',
              {
                style: {
                  fontFamily: typography.fontFamily,
                  fontWeight: 700,
                  fontSize: '36px',
                  color: colors.text,
                },
              },
              stop.city
            ),
            i < Math.min(stops.length, 5) - 1
              ? React.createElement(
                  'span',
                  {
                    style: {
                      marginLeft: 'auto',
                      color: colors.muted,
                      fontSize: '28px',
                    },
                  },
                  '→'
                )
              : null
          )
        )
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 500,
            fontSize: '26px',
            color: colors.secondary,
            marginTop: '32px',
          },
        },
        `${frenchCount} FR · ${euskadiCount} Euskadi · tout sur l'app`
      )
    )
  );
}

/** C3 — Pays Basque France / Espagne — posters + counts below */
export function CrossBorderC3PollSplit({
  frenchCount,
  euskadiCount,
  frenchImage,
  euskadiImage,
}: CrossBorderCounts & { frenchImage?: string | null; euskadiImage?: string | null }) {
  const poster = (img: string | null | undefined, accent: string) =>
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          minHeight: '520px',
          background: colors.surface,
          border: `1px solid ${colors.border}`,
        },
      },
      img
        ? React.createElement('img', {
            src: cacheBustUrl(img),
            style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' },
          })
        : React.createElement('div', {
            style: { position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${accent}55, ${colors.bg})` },
          }),
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35))',
        },
      })
    );

  const stats = (country: string, count: number, accent: string) =>
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          textAlign: 'center' as const,
          paddingTop: '28px',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '40px',
            color: colors.text,
            marginBottom: '8px',
          },
        },
        country
      ),
      React.createElement(
        'div',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '64px',
            lineHeight: '68px',
            color: accent,
          },
        },
        `${count} soirées`
      )
    );

  return React.createElement(
    CarouselSlideLayout,
    { showWatermark: false },
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: colors.bg,
          padding: '48px 40px 56px',
        },
      },
      React.createElement(
        'h1',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '48px',
            lineHeight: '54px',
            color: colors.text,
            textAlign: 'center',
            marginBottom: '10px',
          },
        },
        'Pays Basque : France / Espagne'
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontSize: '28px',
            color: colors.secondary,
            textAlign: 'center',
            marginBottom: '32px',
          },
        },
        'Tu danses de quel côté ce week-end ?'
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '20px', flex: 1, minHeight: 0 } },
        poster(frenchImage, colors.coral),
        poster(euskadiImage, colors.gold)
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '20px' } },
        stats('France', frenchCount, colors.coral),
        stats('Espagne', euskadiCount, colors.gold)
      )
    )
  );
}

/** C4 — One night, two countries (two hero events) */
export function CrossBorderC4TwoNights({
  frenchEvent,
  euskadiEvent,
}: {
  frenchEvent: MediaEvent;
  euskadiEvent: MediaEvent;
}) {
  const row = (event: MediaEvent, label: string, accent: string) => {
    const dt = parseEventStartDatetime(event.start_datetime);
    const img = event.image_url ? cacheBustUrl(event.image_url) : null;
    return React.createElement(
      'div',
      {
        style: {
          flex: 1,
          display: 'flex',
          gap: '28px',
          alignItems: 'center',
          background: colors.surface,
          borderRadius: '24px',
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            width: '280px',
            height: '100%',
            minHeight: '280px',
            background: colors.raised,
            flexShrink: 0,
          },
        },
        img
          ? React.createElement('img', {
              src: img,
              style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' },
            })
          : null
      ),
      React.createElement(
        'div',
        { style: { padding: '28px 28px 28px 0', flex: 1 } },
        React.createElement(
          'div',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 800,
              fontSize: '18px',
              letterSpacing: '3px',
              color: accent,
              marginBottom: '12px',
              textTransform: 'uppercase' as const,
            },
          },
          label
        ),
        React.createElement(
          'div',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 800,
              fontSize: '34px',
              lineHeight: '40px',
              color: colors.text,
              marginBottom: '12px',
            },
          },
          event.title
        ),
        React.createElement(
          'div',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 500,
              fontSize: '24px',
              color: colors.secondary,
            },
          },
          `${event.city || ''} · ${formatDateFrench(dt)} · ${formatTimeFrench(dt)}`
        )
      )
    );
  };

  return React.createElement(
    CarouselSlideLayout,
    { showWatermark: false },
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 48px 64px',
          background: colors.bg,
          gap: '28px',
        },
      },
      React.createElement(
        'h1',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '48px',
            lineHeight: '54px',
            color: colors.text,
            marginBottom: '8px',
          },
        },
        'Une nuit, deux pays'
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontSize: '26px',
            color: colors.secondary,
            marginBottom: '12px',
          },
        },
        'Deux teasers. Le reste est sur LatinGo.'
      ),
      row(frenchEvent, 'Côté français', colors.coral),
      row(euskadiEvent, 'Euskadi', colors.gold)
    )
  );
}
