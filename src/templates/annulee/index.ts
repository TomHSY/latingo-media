import React from 'react';
import { StoryLayout } from '../../components/layouts/StoryLayout';
import { DanceTypePills } from '../../components/DanceTypePill';
import { colors, typography } from '../../tokens/noche';
import { cacheBustUrl } from '../../utils/urls';
import type { MediaEvent } from '../../types';

export interface CancelledStoryProps {
  event: MediaEvent;
  pinBase64: string;
}

export function CancelledStory({ event, pinBase64 }: CancelledStoryProps) {
  const imageSrc = event.image_url ? cacheBustUrl(event.image_url) : null;

  return React.createElement(
    StoryLayout,
    { showWatermark: false },
    // Backdrop — dimmer than normal CE SOIR story
    React.createElement(
      'div',
      { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' } },
      event.image_url
        ? React.createElement('img', {
            src: imageSrc!,
            style: {
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              width: 'calc(100% + 40px)',
              height: 'calc(100% + 40px)',
              objectFit: 'cover',
              filter: 'blur(20px) brightness(0.15)',
            },
          })
        : null,
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,15,20,0.65)',
        },
      })
    ),
    // Content
    React.createElement(
      'div',
      {
        style: {
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 48px',
          textAlign: 'center',
        },
      },
      // Pin logo at top
      React.createElement('img', {
        src: `data:image/png;base64,${pinBase64}`,
        style: {
          height: '180px',
          width: 'auto',
          objectFit: 'contain',
          opacity: 0.9,
          marginBottom: '40px',
        },
      }),
      // ANNULÉE
      React.createElement(
        'div',
        {
          style: {
            color: colors.coral,
            fontSize: '100px',
            fontWeight: 900,
            letterSpacing: '8px',
            lineHeight: '104px',
            marginBottom: '12px',
          },
        },
        'ANNULÉE'
      ),
      // Sub-label
      React.createElement(
        'div',
        {
          style: {
            color: colors.secondary,
            fontSize: '28px',
            fontWeight: 600,
            marginBottom: '48px',
          },
        },
        'Soirée annulée'
      ),
      // Image — tinted
      React.createElement(
        'div',
        {
          style: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: '48px',
            maxHeight: '780px',
            opacity: 0.55,
          },
        },
        event.image_url
          ? React.createElement('img', {
              src: imageSrc!,
              style: {
                maxWidth: '100%',
                maxHeight: '780px',
                objectFit: 'contain',
                borderRadius: '16px',
              },
            })
          : React.createElement('div', {
              style: {
                width: '100%',
                height: '400px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            })
      ),
      // Title — strikethrough
      React.createElement(
        'h1',
        {
          style: {
            fontFamily: typography.fontFamily,
            fontWeight: 800,
            fontSize: '46px',
            lineHeight: '54px',
            color: colors.text,
            marginBottom: event.cancellation_reason ? '16px' : '16px',
            textDecoration: 'line-through',
            opacity: 0.7,
          },
        },
        event.title
      ),
      // Cancellation reason
      event.cancellation_reason
        ? React.createElement(
            'p',
            {
              style: {
                fontFamily: typography.fontFamily,
                fontSize: '32px',
                lineHeight: '40px',
                color: colors.secondary,
                fontStyle: 'italic',
                marginBottom: '16px',
                maxWidth: '900px',
              },
            },
            event.cancellation_reason
          )
        : null,
      // Pills
      React.createElement(DanceTypePills, { danceTypes: event.dance_types, size: 'lg', gap: '10px' })
    )
  );
}
