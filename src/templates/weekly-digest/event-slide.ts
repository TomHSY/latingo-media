import React from 'react';
import { CarouselSlideLayout } from '../../components/layouts/CarouselSlideLayout';
import { DanceTypePills } from '../../components/DanceTypePill';
import { EventImage } from '../../components/EventImage';
import { colors, typography } from '../../tokens/noche';
import { formatDateFrench, formatTimeFrench } from '../../utils/dates';
import { parseEventStartDatetime } from '../../utils/paris-time';
import { cacheBustUrl } from '../../utils/urls';
import type { MediaEvent } from '../../types';

export interface EventSlideProps {
  event: MediaEvent;
  pinBase64: string;
}

export function EventSlide({ event, pinBase64 }: EventSlideProps) {
  const startDt = parseEventStartDatetime(event.start_datetime);
  const imageSrc = event.image_url ? cacheBustUrl(event.image_url) : null;

  return React.createElement(
    CarouselSlideLayout,
    { showWatermark: false },
    React.createElement(
      'div',
      {
        style: {
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        },
      },
      // Layer 1: Blurred backdrop
      imageSrc
        ? React.createElement('img', {
            src: imageSrc,
            style: {
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              width: 'calc(100% + 40px)',
              height: 'calc(100% + 40px)',
              objectFit: 'cover',
              filter: 'blur(20px) brightness(0.3)',
            },
          })
        : null,
      // Layer 2: Dark overlay
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,15,20,0.45)',
        },
      }),
      // Layer 3: Content
      React.createElement(
        'div',
        {
          style: {
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '40px',
            paddingBottom: '50px',
          },
        },
        // Date + city badge
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'center', marginBottom: '24px' } },
          React.createElement(
            'div',
            {
              style: {
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                padding: '14px 28px',
                borderRadius: '12px',
                textAlign: 'center',
              },
            },
            React.createElement('div', {
              style: { color: colors.gold, fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
            }, `${formatDateFrench(startDt)} \u00B7 ${formatTimeFrench(startDt)}`),
            event.city ? React.createElement('div', {
              style: { color: colors.text, fontSize: '22px', fontWeight: 500, marginTop: '8px', opacity: 0.9 },
            }, `\u{1F4CD} ${event.city}`) : null
          )
        ),
        // Image
        React.createElement(
          'div',
          {
            style: {
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            },
          },
          imageSrc
            ? React.createElement('img', {
                src: imageSrc,
                style: {
                  maxWidth: '100%',
                  maxHeight: '750px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                },
              })
            : React.createElement(EventImage, {
                imageUrl: null,
                danceTypes: event.dance_types,
                width: '100%',
                height: '100%',
                mode: 'fallback',
              })
        ),
        // Glass bar
        React.createElement(
          'div',
          {
            style: {
              marginTop: '24px',
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '24px 28px',
              height: '160px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            },
          },
          // Title
          React.createElement('h2', {
            style: {
              fontFamily: typography.fontFamily,
              fontWeight: 700,
              fontSize: '34px',
              lineHeight: '40px',
              color: colors.text,
              marginBottom: '14px',
              maxWidth: '70%',
            },
          }, event.title),
          // Pills
          React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
            React.createElement(DanceTypePills, {
              danceTypes: event.dance_types,
              size: 'lg',
              gap: '10px',
            })
          ),
          // Pin logo
          React.createElement('img', {
            src: `data:image/png;base64,${pinBase64}`,
            style: { position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', height: '150px', width: 'auto', objectFit: 'contain', opacity: 0.85 },
          })
        )
      )
    )
  );
}
