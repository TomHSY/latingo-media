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
  const dateStyle = {
    fontFamily: typography.fontFamily,
    fontWeight: 800,
    fontSize: '160px',
    lineHeight: '160px',
    color: colors.text,
    letterSpacing: '-4px',
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'scale(1.10)',
            transformOrigin: 'center center',
          },
        },
        React.createElement('div', { style: dateStyle }, `${startDay}-${endDay}`),
        React.createElement('div', { style: { ...dateStyle, marginTop: '8px' } }, monthName),
        React.createElement('img', {
          src: `data:image/png;base64,${logoBase64}`,
          style: {
            height: '220px',
            width: 'auto',
            objectFit: 'contain',
            opacity: 0.9,
            marginTop: '56px',
          },
        })
      )
    )
  );
}
