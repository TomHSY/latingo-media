/**
 * Salsa vs Bachata / stats concept explorations (D1–D5).
 */
import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors, typography } from '../../tokens/noche';
import { getDanceType } from '../../tokens/dance-types';

export interface DuelCounts {
  salsaCount: number;
  bachataCount: number;
}

/** D1 — Diagonal floor split */
export function DuelD1FloorSplit({ salsaCount, bachataCount }: DuelCounts) {
  const salsa = getDanceType('salsa');
  const bachata = getDanceType('bachata');

  return React.createElement(
    CarouselSlideLayout,
    { showWatermark: false },
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: colors.bg,
        },
      },
      // Left triangle-ish via skewed panels
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '58%',
          height: '100%',
          background: `linear-gradient(160deg, ${salsa.accent}33, ${colors.bg} 70%)`,
          clipPath: 'polygon(0 0, 100% 0, 72% 100%, 0 100%)',
        },
      }),
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0,
          right: 0,
          width: '58%',
          height: '100%',
          background: `linear-gradient(200deg, ${bachata.accent}33, ${colors.bg} 70%)`,
          clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)',
        },
      }),
      React.createElement(
        'div',
        {
          style: {
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '64px 56px',
          },
        },
        React.createElement(
          'p',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 700,
              fontSize: '42px',
              color: colors.secondary,
              textAlign: 'center',
              marginBottom: '32px',
            },
          },
          'De quel côté du dancefloor ?'
        ),
        React.createElement(
          'div',
          {
            style: {
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
            },
          },
          React.createElement(
            'div',
            { style: { flex: 1, textAlign: 'left' } },
            React.createElement(
              'div',
              {
                style: {
                  fontFamily: typography.fontFamily,
                  fontWeight: 800,
                  fontSize: '84px',
                  lineHeight: '88px',
                  color: salsa.accent,
                  marginBottom: '20px',
                },
              },
              'Salsa'
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontFamily: typography.fontFamily,
                  fontWeight: 700,
                  fontSize: '40px',
                  color: colors.secondary,
                },
              },
              `${salsaCount} soirées`
            )
          ),
          React.createElement(
            'div',
            {
              style: {
                fontFamily: typography.fontFamily,
                fontWeight: 800,
                fontSize: '48px',
                color: colors.muted,
              },
            },
            'VS'
          ),
          React.createElement(
            'div',
            { style: { flex: 1, textAlign: 'right' } },
            React.createElement(
              'div',
              {
                style: {
                  fontFamily: typography.fontFamily,
                  fontWeight: 800,
                  fontSize: '84px',
                  lineHeight: '88px',
                  color: bachata.accent,
                  marginBottom: '20px',
                },
              },
              'Bachata'
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontFamily: typography.fontFamily,
                  fontWeight: 700,
                  fontSize: '40px',
                  color: colors.secondary,
                },
              },
              `${bachataCount} soirées`
            )
          )
        ),
        React.createElement(
          'p',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 600,
              fontSize: '36px',
              color: colors.secondary,
              textAlign: 'center',
            },
          },
          'Filtre par style sur LatinGo'
        )
      )
    )
  );
}

/** D2 — Tribe poster (single style hero) */
export function DuelD2TribePoster({
  styleSlug,
  count,
  vibeLine,
}: {
  styleSlug: 'salsa' | 'bachata';
  count: number;
  vibeLine: string;
}) {
  const dance = getDanceType(styleSlug);
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
          justifyContent: 'flex-end',
          padding: '72px 64px 96px',
          background: `
            radial-gradient(ellipse 100% 80% at 30% 20%, ${dance.accent}66 0%, transparent 50%),
            radial-gradient(ellipse 70% 60% at 90% 90%, ${dance.accent}28 0%, transparent 45%),
            ${colors.bg}
          `,
        },
      },
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 700,
            fontSize: '22px',
            letterSpacing: '4px',
            textTransform: 'uppercase' as const,
            color: dance.accent,
            marginBottom: '24px',
          },
        },
        'Tribe night'
      ),
      React.createElement(
        'h1',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '120px',
            lineHeight: '110px',
            letterSpacing: '-4px',
            color: colors.text,
            marginBottom: '28px',
          },
        },
        dance.label_fr
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 500,
            fontSize: '32px',
            color: colors.secondary,
            marginBottom: '40px',
          },
        },
        vibeLine
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'inline-flex',
            alignSelf: 'flex-start',
            border: `2px solid ${dance.accent}`,
            color: dance.accent,
            fontFamily: typography.fontFamily,
            fontWeight: 700,
            fontSize: '28px',
            padding: '18px 28px',
            borderRadius: '14px',
          },
        },
        `${count} soirées ce week-end`
      )
    )
  );
}

/** D3 — Almost-tie drama */
export function DuelD3AlmostTie({ salsaCount, bachataCount }: DuelCounts) {
  const salsa = getDanceType('salsa');
  const bachata = getDanceType('bachata');
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
          padding: '64px',
          background: colors.bg,
        },
      },
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 700,
            fontSize: '24px',
            letterSpacing: '4px',
            textTransform: 'uppercase' as const,
            color: colors.coral,
            marginBottom: '40px',
          },
        },
        'Score du week-end'
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'baseline',
            gap: '28px',
            marginBottom: '36px',
          },
        },
        React.createElement(
          'span',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 800,
              fontSize: '140px',
              lineHeight: '120px',
              color: salsa.accent,
            },
          },
          String(salsaCount)
        ),
        React.createElement(
          'span',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 700,
              fontSize: '48px',
              color: colors.muted,
            },
          },
          '–'
        ),
        React.createElement(
          'span',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 800,
              fontSize: '140px',
              lineHeight: '120px',
              color: bachata.accent,
            },
          },
          String(bachataCount)
        )
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            width: '420px',
            justifyContent: 'space-between',
            marginBottom: '48px',
          },
        },
        React.createElement(
          'span',
          { style: { fontFamily: typography.fontFamily, fontWeight: 700, fontSize: '28px', color: salsa.accent } },
          'Salsa'
        ),
        React.createElement(
          'span',
          { style: { fontFamily: typography.fontFamily, fontWeight: 700, fontSize: '28px', color: bachata.accent } },
          'Bachata'
        )
      ),
      React.createElement(
        'h2',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '40px',
            lineHeight: '48px',
            textAlign: 'center',
            color: colors.text,
            maxWidth: '800px',
          },
        },
        'Match nul… jusqu\'à dimanche.'
      )
    )
  );
}

/** D4 — Body / vibe metaphor */
export function DuelD4Metaphor({ salsaCount, bachataCount }: DuelCounts) {
  const salsa = getDanceType('salsa');
  const bachata = getDanceType('bachata');
  const col = (title: string, metaphor: string, count: number, accent: string) =>
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          background: colors.surface,
          borderRadius: '28px',
          padding: '48px 36px',
          borderTop: `6px solid ${accent}`,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '40px',
            color: accent,
            marginBottom: '20px',
          },
        },
        title
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 500,
            fontSize: '30px',
            lineHeight: '40px',
            color: colors.text,
            marginBottom: '36px',
            minHeight: '120px',
          },
        },
        metaphor
      ),
      React.createElement(
        'div',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 700,
            fontSize: '26px',
            color: colors.secondary,
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
          padding: '64px 52px',
          background: colors.bg,
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
            marginBottom: '48px',
            textAlign: 'center',
          },
        },
        'Deux énergies.\nUn week-end.'
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '28px', flex: 1 } },
        col('Salsa', 'Plus rapide.\nPlus d\'espace.', salsaCount, salsa.accent),
        col('Bachata', 'Plus proche.\nPlus sensuel.', bachataCount, bachata.accent)
      )
    )
  );
}

export interface StyleBar {
  slug: string;
  label: string;
  count: number;
}

/** D5 — Radar danse (ranked bars, fills the frame) */
export function DuelD5Radar({ styles }: { styles: StyleBar[] }) {
  const max = Math.max(...styles.map((s) => s.count), 1);
  const ranked = [...styles].sort((a, b) => b.count - a.count).slice(0, 5);

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
          padding: '56px 52px 64px',
          background: colors.bg,
        },
      },
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '32px',
            letterSpacing: '4px',
            textTransform: 'uppercase' as const,
            color: colors.coral,
            marginBottom: '20px',
          },
        },
        'Radar danse'
      ),
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
            marginBottom: '40px',
          },
        },
        'Ce week-end,\npar danse'
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '44px',
            flex: 1,
            justifyContent: 'space-evenly',
            padding: '8px 0 16px',
          },
        },
        ...ranked.map((s) => {
          const accent = getDanceType(s.slug).accent;
          const pct = Math.round((s.count / max) * 100);
          return React.createElement(
            'div',
            { key: s.slug },
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '16px',
                },
              },
              React.createElement(
                'span',
                {
                  style: {
                    fontFamily: typography.fontFamily,
                    fontWeight: 700,
                    fontSize: '40px',
                    color: colors.text,
                  },
                },
                s.label
              ),
              React.createElement(
                'span',
                {
                  style: {
                    fontFamily: typography.fontFamily,
                    fontWeight: 800,
                    fontSize: '44px',
                    color: accent,
                  },
                },
                String(s.count)
              )
            ),
            React.createElement(
              'div',
              {
                style: {
                  height: '36px',
                  borderRadius: '999px',
                  background: colors.surface,
                  overflow: 'hidden',
                },
              },
              React.createElement('div', {
                style: {
                  width: `${pct}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: accent,
                },
              })
            )
          );
        })
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 600,
            fontSize: '34px',
            color: colors.secondary,
            marginTop: '24px',
          },
        },
        'Toutes les soirées, filtrables sur l\'app'
      )
    )
  );
}
