import React from 'react';
import { StoryLayout } from '../../components/layouts/StoryLayout';
import { DanceTypePills } from '../../components/DanceTypePill';
import { colors, typography } from '../../tokens/noche';
import { formatTimeFrench } from '../../utils/dates';
import { parseEventStartDatetime } from '../../utils/paris-time';
import type { MediaEvent } from '../../types';

export interface EventStoryProps {
  event: MediaEvent;
  pinBase64: string;
}

export function EventStory({ event, pinBase64 }: EventStoryProps) {
  const storyDate = parseEventStartDatetime(event.start_datetime);

  return React.createElement(
    StoryLayout,
    { showWatermark: false },
    // Backdrop
    React.createElement(
      'div',
      { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' } },
      event.image_url
        ? React.createElement('img', {
            src: event.image_url,
            style: { position: 'absolute', top: '-20px', left: '-20px', width: 'calc(100% + 40px)', height: 'calc(100% + 40px)', objectFit: 'cover', filter: 'blur(20px) brightness(0.3)' },
          })
        : null,
      React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,15,20,0.45)' } })
    ),
    // Content
    React.createElement(
      'div',
      { style: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', textAlign: 'center' } },
      // Pin logo at top
      React.createElement('img', {
        src: `data:image/png;base64,${pinBase64}`,
        style: { height: '180px', width: 'auto', objectFit: 'contain', opacity: 0.9, marginBottom: '40px' },
      }),
      // CE SOIR
      React.createElement('div', {
        style: { color: colors.coral, fontSize: '100px', fontWeight: 900, letterSpacing: '8px', lineHeight: '104px', marginBottom: '12px' },
      }, 'CE SOIR'),
      // Time + Location
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' } },
        React.createElement('span', {
          style: { color: colors.gold, fontSize: '42px', fontWeight: 700 },
        }, `\u00E0 ${formatTimeFrench(storyDate)}`),
        React.createElement('span', {
          style: { color: colors.text, fontSize: '34px', fontWeight: 600, opacity: 0.9 },
        }, `\u{1F4CD} ${event.city || 'Lieu \u00E0 confirmer'}`)
      ),
      // Image
      React.createElement(
        'div',
        { style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '48px', maxHeight: '780px' } },
        event.image_url
          ? React.createElement('img', { src: event.image_url, style: { maxWidth: '100%', maxHeight: '780px', objectFit: 'contain', borderRadius: '16px' } })
          : React.createElement('div', { style: { width: '100%', height: '400px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)' } })
      ),
      // Title
      React.createElement('h1', {
        style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '46px', lineHeight: '54px', color: colors.text, marginBottom: '16px' },
      }, event.title),
      // Pills
      React.createElement(DanceTypePills, { danceTypes: event.dance_types, size: 'lg', gap: '10px' })
    )
  );
}
