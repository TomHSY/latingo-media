import React from 'react';
import { colors } from '../tokens/noche';
import { getDanceType } from '../tokens/dance-types';
import type { EventDanceType } from '../types';

interface EventImageProps {
  imageUrl?: string | null;
  danceTypes?: EventDanceType[];
  width?: string;
  height?: string;
  /** 'hero' = full bleed background, 'thumbnail' = small contained, 'fallback' = branded pattern */
  mode?: 'hero' | 'thumbnail' | 'fallback';
}

/**
 * Handles 3 image scenarios:
 * - imageUrl exists → show image (hero or thumbnail mode)
 * - imageUrl missing → branded fallback with dance type color accent
 */
export function EventImage({
  imageUrl,
  danceTypes = [],
  width = '100%',
  height = '200px',
  mode = 'thumbnail',
}: EventImageProps) {
  // No image → branded fallback
  if (!imageUrl) {
    const primaryType = danceTypes[0];
    const accentColor = primaryType
      ? getDanceType(primaryType.slug).accent
      : colors.coral;

    return (
      <div
        style={{
          width,
          height,
          backgroundColor: colors.raised,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: mode === 'thumbnail' ? '12px' : '0',
        }}
      >
        {/* Decorative gradient accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse at 50% 80%, ${accentColor}22 0%, transparent 70%)`,
          }}
        />
        {/* Dance icon placeholder */}
        <span style={{ fontSize: '48px', opacity: 0.4 }}>💃</span>
      </div>
    );
  }

  // Hero mode — full bleed with dark overlay
  if (mode === 'hero') {
    return (
      <div
        style={{
          width,
          height,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          alt=""
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(15,15,20,0.3) 0%, rgba(15,15,20,0.85) 100%)',
          }}
        />
      </div>
    );
  }

  // Thumbnail mode — contained with rounded corners
  return (
    <div
      style={{
        width,
        height,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <img
        src={imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        alt=""
      />
    </div>
  );
}
