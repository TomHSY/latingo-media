import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors } from '../../tokens/noche';

export interface ClosingProps {
  remaining: number;
  logoBase64: string;
}

export function ClosingSlide({ remaining, logoBase64 }: ClosingProps) {
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
      remaining > 0
        ? React.createElement('div', {
            style: { fontSize: '36px', color: colors.text, fontWeight: 700, marginBottom: '16px', lineHeight: '46px' },
          }, `...et ${remaining} autre${remaining > 1 ? 's' : ''} soir\u00E9e${remaining > 1 ? 's' : ''}`)
        : null,
      remaining > 0
        ? React.createElement('div', {
            style: { fontSize: '36px', color: colors.coral, fontWeight: 700, marginBottom: '80px', lineHeight: '46px' },
          }, 'que tu ne vois pas ici.')
        : null,
      // Huge central logo
      React.createElement('img', {
        src: `data:image/png;base64,${logoBase64}`,
        style: { height: '320px', width: 'auto', objectFit: 'contain', opacity: 0.95, marginBottom: '60px' },
      }),
      // CTA
      React.createElement('div', {
        style: { color: colors.secondary, fontSize: '32px', fontWeight: 600, letterSpacing: '2px' },
      }, '\u2014 Lien en bio \u2014')
    )
  );
}
