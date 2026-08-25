import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors, typography } from '../../tokens/noche';
import { getDanceType } from '../../tokens/dance-types';

export interface LensCoverProps {
  headline: string;
  subheadline?: string;
  accentSlug?: string;
}

export function LensCoverSlide({ headline, subheadline, accentSlug }: LensCoverProps) {
  const accent = accentSlug ? getDanceType(accentSlug).accent : colors.coral;

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
          padding: '80px 60px',
          textAlign: 'center',
        },
      },
      React.createElement('div', {
        style: {
          width: '120px',
          height: '6px',
          borderRadius: '3px',
          backgroundColor: accent,
          marginBottom: '48px',
        },
      }),
      React.createElement('h1', {
        style: {
          fontFamily: typography.fontFamily,
          fontWeight: 800,
          fontSize: '64px',
          lineHeight: '72px',
          color: colors.text,
          letterSpacing: '-1px',
          marginBottom: subheadline ? '24px' : '0',
        },
      }, headline),
      subheadline
        ? React.createElement('p', {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 500,
              fontSize: '32px',
              lineHeight: '40px',
              color: colors.secondary,
            },
          }, subheadline)
        : null
    )
  );
}
