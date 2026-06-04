import React from 'react';
import { getDanceType } from '../tokens/dance-types';
import type { EventDanceType } from '../types';

interface DanceTypePillProps {
  danceType: EventDanceType;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { fontSize: '12px', padding: '4px 10px', borderRadius: '10px' },
  md: { fontSize: '14px', padding: '5px 12px', borderRadius: '12px' },
  lg: { fontSize: '22px', padding: '9px 20px', borderRadius: '16px' },
};

export function DanceTypePill({ danceType, size = 'md' }: DanceTypePillProps) {
  const typeInfo = getDanceType(danceType.slug);
  const sizeStyle = sizeStyles[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: typeInfo.accent,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: 'nowrap',
        ...sizeStyle,
      }}
    >
      {typeInfo.label_fr}
    </span>
  );
}

interface DanceTypePillsProps {
  danceTypes: EventDanceType[];
  size?: 'sm' | 'md' | 'lg';
  gap?: string;
}

export function DanceTypePills({ danceTypes, size = 'md', gap = '6px' }: DanceTypePillsProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap }}>
      {danceTypes.map((dt) => (
        <DanceTypePill key={dt.slug} danceType={dt} size={size} />
      ))}
    </div>
  );
}
