import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { colors, typography } from '../../tokens/noche';

export interface WeeklyStatsProps {
  totalEvents: number;
  activeAreas: number;
  danceStyles: number;
  newEvents: number;
}

export function WeeklyStatsSlide({ totalEvents, activeAreas, danceStyles, newEvents }: WeeklyStatsProps) {
  const tiles = [
    { value: totalEvents, label: 'soirées', sub: 'Thu–Dim' },
    { value: activeAreas, label: 'zones', sub: 'actives' },
    { value: danceStyles, label: 'styles', sub: 'de danse' },
    { value: newEvents, label: 'nouvelles', sub: 'cette semaine' },
  ];

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
          fontSize: '56px',
          color: colors.text,
          textAlign: 'center',
          marginBottom: '64px',
          letterSpacing: '-0.5px',
        },
      }, 'Cette semaine sur LatinGo'),
      React.createElement(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            width: '100%',
            maxWidth: '900px',
          },
        },
        ...tiles.map((tile) =>
          React.createElement(
            'div',
            {
              key: tile.label,
              style: {
                backgroundColor: colors.surface,
                borderRadius: '20px',
                padding: '40px 32px',
                textAlign: 'center',
                border: `1px solid ${colors.border}`,
              },
            },
            React.createElement('div', {
              style: {
                fontFamily: typography.fontFamily,
                fontWeight: 800,
                fontSize: '72px',
                color: colors.gold,
                lineHeight: '80px',
              },
            }, String(tile.value)),
            React.createElement('div', {
              style: {
                fontFamily: typography.fontFamily,
                fontWeight: 600,
                fontSize: '28px',
                color: colors.text,
                marginTop: '8px',
              },
            }, tile.label),
            React.createElement('div', {
              style: {
                fontFamily: typography.fontFamily,
                fontWeight: 400,
                fontSize: '22px',
                color: colors.secondary,
                marginTop: '4px',
              },
            }, tile.sub)
          )
        )
      ),
      React.createElement('p', {
        style: {
          fontFamily: typography.fontFamily,
          fontSize: '26px',
          color: colors.secondary,
          marginTop: '56px',
          textAlign: 'center',
        },
      }, '500+ soirées listées sur l\'app')
    )
  );
}

export interface DanceDuelProps {
  salsaCount: number;
  bachataCount: number;
}

export function DanceDuelSlide({ salsaCount, bachataCount }: DanceDuelProps) {
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
        },
      }, 'Salsa vs Bachata'),
      React.createElement('p', {
        style: {
          fontFamily: typography.fontFamily,
          fontSize: '28px',
          color: colors.secondary,
          marginBottom: '64px',
        },
      }, 'De quel côté danses-tu ce week-end ?'),
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
              backgroundColor: 'rgba(255,107,90,0.15)',
              borderRadius: '24px',
              padding: '48px 32px',
              textAlign: 'center',
              border: '2px solid #FF6B5A',
            },
          },
          React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '💃'),
          React.createElement('div', {
            style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '96px', color: '#FF6B5A' },
          }, String(salsaCount)),
          React.createElement('div', {
            style: { fontFamily: typography.fontFamily, fontWeight: 700, fontSize: '36px', color: colors.text, marginTop: '8px' },
          }, 'Salsa')
        ),
        React.createElement(
          'div',
          {
            style: {
              flex: 1,
              backgroundColor: 'rgba(255,191,71,0.12)',
              borderRadius: '24px',
              padding: '48px 32px',
              textAlign: 'center',
              border: '2px solid #FFBF47',
            },
          },
          React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '🕺'),
          React.createElement('div', {
            style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '96px', color: '#FFBF47' },
          }, String(bachataCount)),
          React.createElement('div', {
            style: { fontFamily: typography.fontFamily, fontWeight: 700, fontSize: '36px', color: colors.text, marginTop: '8px' },
          }, 'Bachata')
        )
      ),
      React.createElement('p', {
        style: {
          fontFamily: typography.fontFamily,
          fontSize: '24px',
          color: colors.secondary,
          marginTop: '56px',
          textAlign: 'center',
        },
      }, 'Filtre par style sur l\'app LatinGo')
    )
  );
}
