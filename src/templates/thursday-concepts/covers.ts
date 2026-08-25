/**
 * Thursday cover concept explorations (A1–A5).
 * Prototypes only — founder picks before production.
 */
import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors, typography } from '../../tokens/noche';
import { getDanceType } from '../../tokens/dance-types';
import { cacheBustUrl } from '../../utils/urls';

export interface CoverConceptProps {
  headline: string;
  proofLine: string;
  accentSlug?: string;
  subheadline?: string;
  /** Big word for A4 / area name for A5 */
  heroWord?: string;
  imageUrls?: string[];
}

function accentOf(slug?: string): string {
  return slug ? getDanceType(slug).accent : colors.coral;
}

/** A1 — Mood field: radial wash + huge type */
export function CoverA1MoodField({ headline, proofLine, accentSlug }: CoverConceptProps) {
  const accent = accentOf(accentSlug);
  return React.createElement(
    CarouselSlideLayout,
    { showWatermark: false },
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '72px 64px 100px',
          background: `
            radial-gradient(ellipse 90% 70% at 50% 20%, ${accent}55 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 80% 80%, ${accent}22 0%, transparent 50%),
            ${colors.bg}
          `,
        },
      },
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        },
      }),
      React.createElement(
        'div',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 700,
            fontSize: '22px',
            letterSpacing: '4px',
            textTransform: 'uppercase' as const,
            color: accent,
            marginBottom: '28px',
          },
        },
        'Jeudi · Lens'
      ),
      React.createElement(
        'h1',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '72px',
            lineHeight: '78px',
            letterSpacing: '-2px',
            color: colors.text,
            marginBottom: '28px',
            maxWidth: '920px',
          },
        },
        headline
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 500,
            fontSize: '28px',
            color: colors.secondary,
          },
        },
        proofLine
      )
    )
  );
}

/** A2 — Magazine masthead */
export function CoverA2Magazine({ headline, proofLine, accentSlug, subheadline }: CoverConceptProps) {
  const accent = accentOf(accentSlug);
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
          padding: '56px 56px 72px',
          background: colors.bg,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            borderBottom: `2px solid ${colors.border}`,
            paddingBottom: '24px',
            marginBottom: '40px',
          },
        },
        React.createElement(
          'span',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 800,
              fontSize: '48px',
              color: colors.text,
              letterSpacing: '-0.5px',
            },
          },
          'LatinGo'
        )
      ),
      React.createElement('div', {
        style: {
          width: '220px',
          height: '16px',
          backgroundColor: accent,
          borderRadius: '2px',
          marginBottom: '40px',
          transform: 'rotate(-1.5deg)',
        },
      }),
      React.createElement(
        'h1',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: subheadline ? '88px' : '96px',
            lineHeight: subheadline ? '94px' : '102px',
            letterSpacing: '-3px',
            color: colors.text,
            flex: subheadline ? undefined : 1,
            marginBottom: subheadline ? '28px' : undefined,
          },
        },
        headline
      ),
      subheadline
        ? React.createElement(
            'p',
            {
              style: {
                fontFamily: typography.fontFamily,
                fontWeight: 600,
                fontSize: '38px',
                lineHeight: '48px',
                color: colors.secondary,
                flex: 1,
                marginBottom: '24px',
              },
            },
            subheadline
          )
        : null,
      React.createElement(
        'div',
        {
          style: {
            borderTop: `1px solid ${colors.border}`,
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '24px',
          },
        },
        React.createElement(
          'span',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 600,
              fontSize: '40px',
              color: colors.secondary,
            },
          },
          proofLine
        ),
        React.createElement(
          'span',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 700,
              fontSize: '36px',
              color: accent,
              whiteSpace: 'nowrap' as const,
            },
          },
          'Sur l\'app →'
        )
      )
    )
  );
}

/** A2 region focus — same magazine frame, area headline */
export function CoverA2RegionFocus({ headline, proofLine, accentSlug, subheadline }: CoverConceptProps) {
  return React.createElement(CoverA2Magazine, {
    headline,
    proofLine,
    accentSlug: accentSlug ?? 'salsa',
    subheadline,
  });
}

/** A3 — Collage teaser with glass strip */
export function CoverA3Collage({ headline, proofLine, accentSlug, imageUrls = [] }: CoverConceptProps) {
  const accent = accentOf(accentSlug);
  const imgs = [0, 1, 2].map((i) => imageUrls[i] || null);

  return React.createElement(
    CarouselSlideLayout,
    { showWatermark: false },
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          background: colors.bg,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gridTemplateRows: '1fr 1fr',
            gap: '8px',
            padding: '8px',
            minHeight: 0,
          },
        },
        React.createElement(
          'div',
          {
            style: {
              gridRow: '1 / 3',
              borderRadius: '16px',
              overflow: 'hidden',
              background: colors.surface,
              position: 'relative',
            },
          },
          imgs[0]
            ? React.createElement('img', {
                src: cacheBustUrl(imgs[0]),
                style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' },
              })
            : null
        ),
        ...[1, 2].map((i) =>
          React.createElement(
            'div',
            {
              key: i,
              style: {
                borderRadius: '16px',
                overflow: 'hidden',
                background: colors.surface,
              },
            },
            imgs[i]
              ? React.createElement('img', {
                  src: cacheBustUrl(imgs[i]!),
                  style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' },
                })
              : null
          )
        )
      ),
      React.createElement(
        'div',
        {
          style: {
            margin: '0 24px 40px',
            marginTop: '-80px',
            position: 'relative',
            zIndex: 2,
            background: 'rgba(15,15,20,0.82)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: `1px solid ${colors.border}`,
            padding: '40px 44px',
          },
        },
        React.createElement('div', {
          style: {
            width: '64px',
            height: '6px',
            backgroundColor: accent,
            borderRadius: '3px',
            marginBottom: '20px',
          },
        }),
        React.createElement(
          'h1',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 800,
              fontSize: '56px',
              lineHeight: '62px',
              letterSpacing: '-1.5px',
              color: colors.text,
              marginBottom: '14px',
            },
          },
          headline
        ),
        React.createElement(
          'p',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 600,
              fontSize: '30px',
              color: colors.secondary,
            },
          },
          proofLine
        )
      )
    )
  );
}

/** A4 — One word + one proof */
export function CoverA4OneWord({ heroWord = 'BAB', proofLine, accentSlug }: CoverConceptProps) {
  const accent = accentOf(accentSlug);
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          background: colors.bg,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: heroWord.length <= 5 ? '180px' : '120px',
            lineHeight: 0.9,
            letterSpacing: '-6px',
            color: colors.text,
            textAlign: 'center',
            marginBottom: '48px',
          },
        },
        heroWord
      ),
      React.createElement('div', {
        style: {
          width: '80px',
          height: '6px',
          backgroundColor: accent,
          borderRadius: '3px',
          marginBottom: '32px',
        },
      }),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 500,
            fontSize: '32px',
            color: colors.secondary,
            textAlign: 'center',
          },
        },
        proofLine
      )
    )
  );
}

/** A5 — Real regional map with lenses on BAB / Landes / Béarn / Euskadi */
export function CoverA5MapWhisper({
  headline,
  proofLine,
}: CoverConceptProps) {
  const lenses: Array<{
    id: string;
    label: string;
    cx: number;
    cy: number;
    r: number;
    accent: string;
  }> = [
    { id: 'landes', label: 'Landes', cx: 520, cy: 210, r: 78, accent: colors.gold },
    { id: 'bab', label: 'BAB', cx: 250, cy: 390, r: 88, accent: colors.coral },
    { id: 'bearn', label: 'Béarn', cx: 720, cy: 430, r: 82, accent: '#B98EFF' },
    { id: 'euskadi', label: 'Euskadi', cx: 340, cy: 620, r: 90, accent: '#5CC8F5' },
  ];

  return React.createElement(
    CarouselSlideLayout,
    { showWatermark: false },
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '48px 48px 72px',
          background: colors.bg,
          overflow: 'hidden',
        },
      },
      React.createElement(
        'svg',
        {
          width: '1080',
          height: '980',
          viewBox: '0 0 1080 900',
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
          },
        },
        // Ocean (Bay of Biscay)
        React.createElement('rect', { x: 0, y: 0, width: 1080, height: 900, fill: '#0B1524' }),
        React.createElement('path', {
          d: 'M0 80 C40 120, 60 180, 50 240 C30 340, 20 420, 35 520 C55 650, 40 760, 0 820 Z',
          fill: '#13253A',
        }),
        // France land mass (simplified SW coast → inland)
        React.createElement('path', {
          d: 'M70 60 L980 40 L1040 860 L420 880 C380 780, 300 720, 220 680 C160 640, 110 560, 95 460 C80 340, 90 220, 70 60 Z',
          fill: '#1A2438',
          stroke: '#2E3A52',
          strokeWidth: '2',
        }),
        // Spain / Euskadi land (south of border)
        React.createElement('path', {
          d: 'M95 520 C160 500, 240 540, 320 560 C420 590, 520 620, 640 640 C760 665, 900 700, 1040 720 L1040 880 L420 880 C360 800, 280 720, 200 680 C140 645, 100 580, 95 520 Z',
          fill: '#162032',
          stroke: '#2E3A52',
          strokeWidth: '2',
        }),
        // Border line FR/ES
        React.createElement('path', {
          d: 'M95 520 C180 505, 280 545, 380 575 C500 615, 640 645, 820 675 C920 695, 1000 710, 1040 720',
          fill: 'none',
          stroke: colors.coral,
          strokeWidth: '3',
          strokeDasharray: '10 8',
          opacity: '0.85',
        }),
        // Coastline emphasis
        React.createElement('path', {
          d: 'M70 60 C90 140, 75 230, 95 320 C110 400, 85 470, 95 520 C70 600, 55 700, 40 780',
          fill: 'none',
          stroke: '#3D5A80',
          strokeWidth: '4',
          strokeLinecap: 'round',
        }),
        // Region washes
        React.createElement('ellipse', { cx: 520, cy: 210, rx: 160, ry: 110, fill: `${colors.gold}22` }),
        React.createElement('ellipse', { cx: 250, cy: 390, rx: 150, ry: 120, fill: `${colors.coral}28` }),
        React.createElement('ellipse', { cx: 720, cy: 430, rx: 155, ry: 115, fill: 'rgba(185,142,255,0.18)' }),
        React.createElement('ellipse', { cx: 340, cy: 620, rx: 170, ry: 125, fill: 'rgba(92,200,245,0.18)' }),
        // City dots
        ...[
          [230, 370],
          [210, 400],
          [260, 410],
          [500, 180],
          [560, 230],
          [740, 450],
          [300, 600],
          [380, 640],
        ].map(([x, y], i) =>
          React.createElement('circle', {
            key: `dot-${i}`,
            cx: x,
            cy: y,
            r: 5,
            fill: colors.secondary,
            opacity: 0.7,
          })
        ),
        // Lenses
        ...lenses.flatMap((lens) => [
          React.createElement('circle', {
            key: `${lens.id}-outer`,
            cx: lens.cx,
            cy: lens.cy,
            r: lens.r + 10,
            fill: 'none',
            stroke: lens.accent,
            strokeWidth: 3,
            opacity: 0.35,
          }),
          React.createElement('circle', {
            key: `${lens.id}-glass`,
            cx: lens.cx,
            cy: lens.cy,
            r: lens.r,
            fill: `${lens.accent}18`,
            stroke: lens.accent,
            strokeWidth: 5,
          }),
          React.createElement('circle', {
            key: `${lens.id}-inner`,
            cx: lens.cx,
            cy: lens.cy,
            r: lens.r - 14,
            fill: 'none',
            stroke: colors.white,
            strokeWidth: 1.5,
            opacity: 0.35,
          }),
          React.createElement(
            'text',
            {
              key: `${lens.id}-label`,
              x: lens.cx,
              y: lens.cy + 10,
              textAnchor: 'middle',
              fill: colors.text,
              fontFamily: typography.fontFamily,
              fontWeight: 800,
              fontSize: 28,
            },
            lens.label
          ),
        ]),
        React.createElement(
          'text',
          {
            x: 48,
            y: 870,
            fill: colors.muted,
            fontFamily: typography.fontFamily,
            fontSize: 18,
          },
          'Golfe de Gascogne · frontière FR / ES'
        )
      ),
      React.createElement(
        'div',
        {
          style: {
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(180deg, transparent, rgba(15,15,20,0.92) 30%, rgba(15,15,20,0.98))',
            paddingTop: '80px',
          },
        },
        React.createElement(
          'h1',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 800,
              fontSize: '64px',
              lineHeight: '70px',
              letterSpacing: '-1.5px',
              color: colors.text,
              marginBottom: '16px',
              maxWidth: '920px',
            },
          },
          headline
        ),
        React.createElement(
          'p',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 600,
              fontSize: '30px',
              color: colors.secondary,
            },
          },
          proofLine
        )
      )
    )
  );
}
