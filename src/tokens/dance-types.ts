/**
 * Dance Type taxonomy — 7 fixed types with brand accent colors.
 */

export interface DanceType {
  slug: string;
  label_fr: string;
  accent: string;
  bg: string;
}

export const DANCE_TYPES: Record<string, DanceType> = {
  salsa: {
    slug: 'salsa',
    label_fr: 'Salsa',
    accent: '#FF6B5A',
    bg: 'rgba(232,67,45,0.18)',
  },
  bachata: {
    slug: 'bachata',
    label_fr: 'Bachata',
    accent: '#FFBF47',
    bg: 'rgba(245,166,35,0.18)',
  },
  kizomba: {
    slug: 'kizomba',
    label_fr: 'Kizomba',
    accent: '#B98EFF',
    bg: 'rgba(124,58,237,0.18)',
  },
  zouk: {
    slug: 'zouk',
    label_fr: 'Zouk',
    accent: '#5CC8F5',
    bg: 'rgba(14,165,233,0.18)',
  },
  'west-coast-swing': {
    slug: 'west-coast-swing',
    label_fr: 'West Coast Swing',
    accent: '#5EE8B7',
    bg: 'rgba(16,185,129,0.18)',
  },
  semba: {
    slug: 'semba',
    label_fr: 'Semba',
    accent: '#FF7070',
    bg: 'rgba(220,38,38,0.18)',
  },
  'tango-argentin': {
    slug: 'tango-argentin',
    label_fr: 'Tango argentin',
    accent: '#F5A855',
    bg: 'rgba(180,83,9,0.18)',
  },
};

export const DEFAULT_DANCE_TYPE: DanceType = {
  slug: 'unknown',
  label_fr: 'Danse',
  accent: '#FF4E3A',
  bg: 'rgba(255,78,58,0.18)',
};

export function getDanceType(slug: string): DanceType {
  return DANCE_TYPES[slug] || DEFAULT_DANCE_TYPE;
}
