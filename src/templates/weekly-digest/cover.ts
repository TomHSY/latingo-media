import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors, typography } from '../../tokens/noche';

export interface CoverProps {
  startDay: number;
  endDay: number;
  monthName: string;
}

export function CoverSlide({ startDay, endDay, monthName }: CoverProps) {
  const dateStyle = {
    fontFamily: typography.fontFamily,
    fontWeight: 800,
    fontSize: '200px',
    lineHeight: '200px',
    color: colors.text,
    letterSpacing: '-4px',
    textAlign: 'center' as const,
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
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        },
      },
      React.createElement('div', { style: dateStyle }, `${startDay}-${endDay}`),
      React.createElement('div', { style: { ...dateStyle, marginTop: '12px' } }, monthName)
    )
  );
}
