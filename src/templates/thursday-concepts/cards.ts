/**
 * Thursday-specific event card + manifesto closing (diversity vs Tuesday carousel).
 */
import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors, typography } from '../../tokens/noche';
import { getDanceType } from '../../tokens/dance-types';
import { formatDateFrench, formatTimeFrench } from '../../utils/dates';
import { parseEventStartDatetime } from '../../utils/paris-time';
import { cacheBustUrl } from '../../utils/urls';
import type { MediaEvent } from '../../types';

function resolveHighlightDance(
  event: MediaEvent,
  highlightDanceSlug?: string,
  regionSpotlight?: boolean
): { slug: string; label_fr: string } | undefined {
  const types = event.dance_types ?? [];
  if (highlightDanceSlug) {
    const match = types.find((d) => d.slug === highlightDanceSlug);
    if (match) return match;
  }
  if (types.length === 0) return undefined;
  if (regionSpotlight && types.length > 1) {
    const label = types
      .slice(0, 3)
      .map((d) => d.label_fr)
      .join(' · ');
    return { slug: types[0].slug, label_fr: types.length > 3 ? `${label}…` : label };
  }
  return types[0];
}

export interface ThursdayEventCardProps {
  event: MediaEvent;
  index: number;
  total: number;
  /** Featured dance slug for spotlight / rare dance for autres-danses */
  highlightDanceSlug?: string;
  /** Region spotlight: show all dance tags on the chip (mixed styles OK) */
  regionSpotlight?: boolean;
}

/** B — Full-bleed photo card, overlay type (not Tuesday chrome) */
export function ThursdayEventCard({
  event,
  index,
  total,
  highlightDanceSlug,
  regionSpotlight,
}: ThursdayEventCardProps) {
  const startDt = parseEventStartDatetime(event.start_datetime);
  const imageSrc = event.image_url ? cacheBustUrl(event.image_url) : null;
  const primaryDance = resolveHighlightDance(event, highlightDanceSlug, regionSpotlight);
  const accent = primaryDance ? getDanceType(primaryDance.slug).accent : colors.coral;
  const chipFontSize = (primaryDance?.label_fr.length ?? 0) > 22 ? '34px' : '48px';

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
      imageSrc
        ? React.createElement('img', {
            src: imageSrc,
            style: {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            },
          })
        : React.createElement('div', {
            style: {
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(160deg, ${accent}44, ${colors.bg})`,
            },
          }),
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(15,15,20,0.15) 0%, rgba(15,15,20,0.25) 40%, rgba(15,15,20,0.92) 78%, rgba(15,15,20,0.98) 100%)',
        },
      }),
      React.createElement(
        'div',
        {
          style: {
            position: 'absolute',
            top: '48px',
            left: '48px',
            right: '48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        },
        React.createElement(
          'span',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 700,
              fontSize: '28px',
              letterSpacing: '3px',
              textTransform: 'uppercase' as const,
              color: colors.text,
              background: 'rgba(0,0,0,0.45)',
              padding: '14px 24px',
              borderRadius: '999px',
              backdropFilter: 'blur(8px)',
            },
          },
          `${index + 1} / ${total}`
        ),
        primaryDance
          ? React.createElement(
              'span',
              {
                style: {
                  fontFamily: typography.fontFamily,
                  fontWeight: 800,
                  fontSize: chipFontSize,
                  color: colors.bg,
                  background: accent,
                  padding: '22px 40px',
                  borderRadius: '999px',
                },
              },
              primaryDance.label_fr
            )
          : null
      ),
      React.createElement(
        'div',
        {
          style: {
            position: 'absolute',
            left: '48px',
            right: '48px',
            bottom: '56px',
          },
        },
        React.createElement(
          'p',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 700,
              fontSize: '36px',
              color: accent,
              marginBottom: '18px',
            },
          },
          `${formatDateFrench(startDt)} · ${formatTimeFrench(startDt)}`
        ),
        React.createElement(
          'h2',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 800,
              fontSize: '72px',
              lineHeight: '78px',
              letterSpacing: '-1.5px',
              color: colors.text,
              marginBottom: '18px',
            },
          },
          event.title
        ),
        React.createElement(
          'p',
          {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 600,
              fontSize: '40px',
              color: colors.secondary,
            },
          },
          event.city || ''
        )
      )
    )
  );
}

/** B — Manifesto closing (not Tuesday "+X autres" clone) */
export function ThursdayManifestoClosing({ remaining }: { remaining: number }) {
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
          padding: '80px 72px',
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, ${colors.coral}33 0%, transparent 55%),
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
            fontSize: '34px',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
            color: colors.coral,
            marginBottom: '36px',
          },
        },
        'Le reste est sur l\'app'
      ),
      React.createElement(
        'h1',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '80px',
            lineHeight: '88px',
            letterSpacing: '-2px',
            color: colors.text,
            marginBottom: '40px',
          },
        },
        remaining > 0
          ? `${remaining} autres soirées t'attendent.`
          : 'Toute la scène SBK du Sud-Ouest.'
      ),
      React.createElement(
        'p',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 500,
            fontSize: '36px',
            lineHeight: '48px',
            color: colors.secondary,
            maxWidth: '860px',
            marginBottom: '56px',
          },
        },
        'Instagram te montre un aperçu. LatinGo te donne l\'agenda complet — près de chez toi.'
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'inline-flex',
            alignSelf: 'flex-start',
            background: colors.coral,
            color: colors.white,
            fontFamily: typography.fontFamily,
            fontWeight: 700,
            fontSize: '34px',
            padding: '24px 40px',
            borderRadius: '16px',
          },
        },
        'Lien en Bio'
      )
    )
  );
}
