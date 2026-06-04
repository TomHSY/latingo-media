import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors, typography } from '../../tokens/noche';

export interface CoverProps {
  startDay: number;
  endDay: number;
  monthName: string;
  logoBase64: string;
}

export function CoverSlide({ startDay, endDay, monthName, logoBase64 }: CoverProps) {
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
        },
      },
      React.createElement('div', {
        style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '160px', lineHeight: '160px', color: colors.text, letterSpacing: '-4px' },
      }, `${startDay}-${endDay}`),
      React.createElement('div', {
        style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '160px', lineHeight: '160px', color: colors.text, letterSpacing: '-4px', marginTop: '8px' },
      }, monthName)
    ),
    React.createElement('img', {
      src: `data:image/png;base64,${logoBase64}`,
      style: { height: '220px', width: 'auto', objectFit: 'contain', opacity: 0.9, marginBottom: '80px' },
    })
  );
}
