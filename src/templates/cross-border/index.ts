import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors, typography } from '../../tokens/noche';

export interface CrossBorderProps {
  frenchCount: number;
  euskadiCount: number;
}

export function CrossBorderSlide({ frenchCount, euskadiCount }: CrossBorderProps) {
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
          padding: '60px',
        },
      },
      React.createElement('h1', {
        style: {
          fontFamily: typography.fontFamily,
          fontWeight: 800,
          fontSize: '52px',
          color: colors.text,
          textAlign: 'center',
          marginBottom: '16px',
          lineHeight: '60px',
        },
      }, "L'autre côté de la frontière"),
      React.createElement('p', {
        style: {
          fontFamily: typography.fontFamily,
          fontSize: '28px',
          color: colors.secondary,
          marginBottom: '64px',
          textAlign: 'center',
        },
      }, 'Ce week-end en SBK'),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            gap: '40px',
            width: '100%',
            maxWidth: '920px',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: '24px',
              padding: '48px 32px',
              textAlign: 'center',
              border: `1px solid ${colors.border}`,
            },
          },
          React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '🇫🇷'),
          React.createElement('div', {
            style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '96px', color: colors.coral },
          }, String(frenchCount)),
          React.createElement('div', {
            style: { fontFamily: typography.fontFamily, fontWeight: 600, fontSize: '28px', color: colors.secondary, marginTop: '8px' },
          }, 'soirées côté français')
        ),
        React.createElement(
          'div',
          {
            style: {
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: '24px',
              padding: '48px 32px',
              textAlign: 'center',
              border: `1px solid ${colors.border}`,
            },
          },
          React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '🇪🇸'),
          React.createElement('div', {
            style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '96px', color: colors.gold },
          }, String(euskadiCount)),
          React.createElement('div', {
            style: { fontFamily: typography.fontFamily, fontWeight: 600, fontSize: '28px', color: colors.secondary, marginTop: '8px' },
          }, 'soirées en Euskadi')
        )
      ),
      React.createElement('p', {
        style: {
          fontFamily: typography.fontFamily,
          fontSize: '26px',
          color: colors.text,
          marginTop: '56px',
          textAlign: 'center',
          fontWeight: 600,
        },
      }, 'Explore les deux côtés sur l\'app')
    )
  );
}
