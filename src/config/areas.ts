/**
 * Geographic areas for Thursday lens rotation.
 * Maps API city names → BAB / Landes / Béarn / Euskadi.
 */
import type { MediaEvent } from '../types';
import { getDanceType } from '../tokens/dance-types';

export type AreaSlug = 'bab' | 'landes' | 'bearn' | 'euskadi';

export interface AreaDefinition {
  slug: AreaSlug;
  displayName: string;
  isFrench: boolean;
}

export const AREAS: Record<AreaSlug, AreaDefinition> = {
  bab: { slug: 'bab', displayName: 'BAB', isFrench: true },
  landes: { slug: 'landes', displayName: 'Landes', isFrench: true },
  bearn: { slug: 'bearn', displayName: 'Béarn', isFrench: true },
  euskadi: { slug: 'euskadi', displayName: 'Euskadi', isFrench: false },
};

export const FRENCH_AREAS: AreaSlug[] = ['bab', 'landes', 'bearn'];

/** Normalize city for lookup: lowercase, strip accents. */
export function normalizeCity(city: string | null | undefined): string {
  return (city || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const CITY_TO_AREA: Record<string, AreaSlug> = {
  // BAB
  bayonne: 'bab',
  anglet: 'bab',
  biarritz: 'bab',
  bidart: 'bab',
  arbonne: 'bab',
  bassussarry: 'bab',
  ustaritz: 'bab',
  lahonce: 'bab',
  jatxou: 'bab',
  arcangues: 'bab',
  // Landes
  dax: 'landes',
  'mont-de-marsan': 'landes',
  'saint-paul-les-dax': 'landes',
  'saint-paul-lès-dax': 'landes',
  'aire-sur-ladour': 'landes',
  'aire-sur-l\'adour': 'landes',
  capbreton: 'landes',
  hossegor: 'landes',
  seignosse: 'landes',
  'saint-vincent-de-tyrosse': 'landes',
  'saint-andre-de-seignanx': 'landes',
  'saint-andré-de-seignanx': 'landes',
  'saint-lon-les-mines': 'landes',
  tartas: 'landes',
  morcenx: 'landes',
  // Béarn
  pau: 'bearn',
  tarbes: 'bearn',
  lourdes: 'bearn',
  orthez: 'bearn',
  oloron: 'bearn',
  'oloron-sainte-marie': 'bearn',
  'saint-jean-de-luz': 'bearn',
  // Euskadi (Spanish Basque Country)
  donostia: 'euskadi',
  'san-sebastian': 'euskadi',
  'saint-sebastien': 'euskadi',
  hondarribia: 'euskadi',
  fuenterrabia: 'euskadi',
  irun: 'euskadi',
  ergoien: 'euskadi',
  gipuzkoa: 'euskadi',
  bilbao: 'euskadi',
  bilbo: 'euskadi',
  getxo: 'euskadi',
  barakaldo: 'euskadi',
  eibar: 'euskadi',
  zarautz: 'euskadi',
  renteria: 'euskadi',
  'pasaia': 'euskadi',
  pasajes: 'euskadi',
  behobia: 'euskadi',
  behobie: 'euskadi',
};

export function getAreaForCity(city: string | null | undefined): AreaSlug | null {
  const key = normalizeCity(city);
  if (!key) return null;
  return CITY_TO_AREA[key] ?? null;
}

export function getAreaForEvent(event: { city?: string | null }): AreaSlug | null {
  return getAreaForCity(event.city);
}

export function getAreaDefinition(slug: AreaSlug): AreaDefinition {
  return AREAS[slug];
}

/** Instagram cover lines for Thursday area-focus (readable place names). */
export const AREA_FOCUS_HEADLINES: Record<AreaSlug, string> = {
  bab: 'Où danser au Pays Basque ce week-end ?',
  landes: 'Où danser dans les Landes ce week-end ?',
  bearn: 'Où danser autour de Pau ce week-end ?',
  euskadi: 'Où danser en Espagne ce week-end ?',
};

export function buildAreaFocusHeadline(slug: AreaSlug): string {
  return AREA_FOCUS_HEADLINES[slug];
}

const AREA_STYLE_ORDER = [
  'salsa',
  'bachata',
  'kizomba',
  'zouk',
  'tango-argentin',
  'semba',
  'west-coast-swing',
] as const;

/** Region spotlight cover line: total events + dance styles present (all styles, not pure-only). */
export function buildAreaFocusSubheadline(events: MediaEvent[], area: AreaSlug): string {
  const areaEvents = events.filter((e) => getAreaForEvent(e) === area);
  const count = areaEvents.length;
  const present = new Set<string>();
  for (const event of areaEvents) {
    for (const dance of event.dance_types || []) {
      present.add(dance.slug);
    }
  }
  const labels: string[] = [];
  for (const slug of AREA_STYLE_ORDER) {
    if (present.has(slug)) labels.push(getDanceType(slug).label_fr);
  }
  for (const slug of present) {
    if (!AREA_STYLE_ORDER.includes(slug as (typeof AREA_STYLE_ORDER)[number])) {
      labels.push(getDanceType(slug).label_fr);
    }
  }
  const styles = labels.slice(0, 5).join(' · ');
  const countLine = `${count} soirée${count > 1 ? 's' : ''}`;
  return styles ? `${countLine} · ${styles}` : countLine;
}

