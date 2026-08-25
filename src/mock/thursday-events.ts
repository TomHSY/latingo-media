import type { MediaEvent } from '../types';
import { getParisThuSunBounds } from '../utils/paris-time';

/**
 * Mock Thu–Sun events for offline Thursday lens preview.
 * Dates align with the upcoming Thu–Sun window from reference.
 */
export function getMockThursdayWindowEvents(reference = new Date()): MediaEvent[] {
  const { thursdayLabel } = getParisThuSunBounds(reference);

  const addDays = (label: string, delta: number): string => {
    const [y, m, d] = label.split('-').map(Number);
    const anchor = new Date(y, m - 1, d + delta);
    return `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, '0')}-${String(anchor.getDate()).padStart(2, '0')}`;
  };

  const at = (dayOffset: number, hour: number, minute = 0): string => {
    const day = addDays(thursdayLabel, dayOffset);
    return `${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  };

  return [
    {
      id: 'mock-salsa-1',
      title: 'Noche Latina Bayonne',
      start_datetime: at(0, 21),
      end_datetime: at(1, 2),
      city: 'Bayonne',
      dance_types: [{ id: '1', slug: 'salsa', label_fr: 'Salsa' }],
      rsvp_count: 22,
      view_count: 120,
      status: 'active',
    },
    {
      id: 'mock-salsa-2',
      title: 'Salsa Cubaine Anglet',
      start_datetime: at(1, 20, 30),
      end_datetime: at(1, 23, 30),
      city: 'Anglet',
      dance_types: [{ id: '1', slug: 'salsa', label_fr: 'Salsa' }],
      rsvp_count: 14,
      status: 'active',
    },
    {
      id: 'mock-salsa-bachata',
      title: 'SBK Light Biarritz',
      start_datetime: at(2, 21),
      end_datetime: at(3, 1),
      city: 'Biarritz',
      dance_types: [
        { id: '1', slug: 'salsa', label_fr: 'Salsa' },
        { id: '2', slug: 'bachata', label_fr: 'Bachata' },
      ],
      rsvp_count: 18,
      status: 'active',
    },
    {
      id: 'mock-sbk-full',
      title: 'Grande Soirée SBK',
      start_datetime: at(2, 22),
      end_datetime: at(3, 2),
      city: 'Dax',
      dance_types: [
        { id: '1', slug: 'salsa', label_fr: 'Salsa' },
        { id: '2', slug: 'bachata', label_fr: 'Bachata' },
        { id: '3', slug: 'kizomba', label_fr: 'Kizomba' },
      ],
      rsvp_count: 30,
      is_popular: true,
      status: 'active',
    },
    {
      id: 'mock-bachata-1',
      title: 'Bachata Sensual Night',
      start_datetime: at(0, 22),
      end_datetime: at(1, 2),
      city: 'Biarritz',
      dance_types: [{ id: '2', slug: 'bachata', label_fr: 'Bachata' }],
      rsvp_count: 26,
      status: 'active',
    },
    {
      id: 'mock-bachata-2',
      title: 'Dominicana Dax',
      start_datetime: at(1, 21),
      end_datetime: at(2, 1),
      city: 'Dax',
      dance_types: [{ id: '2', slug: 'bachata', label_fr: 'Bachata' }],
      rsvp_count: 11,
      status: 'active',
    },
    {
      id: 'mock-kiz-1',
      title: 'Kizomba Pau',
      start_datetime: at(3, 21),
      end_datetime: at(4, 1),
      city: 'Pau',
      dance_types: [{ id: '3', slug: 'kizomba', label_fr: 'Kizomba' }],
      rsvp_count: 9,
      status: 'active',
    },
    {
      id: 'mock-zouk',
      title: 'Zouk Social',
      start_datetime: at(2, 20),
      end_datetime: at(2, 23),
      city: 'Tarbes',
      dance_types: [{ id: '4', slug: 'zouk', label_fr: 'Zouk' }],
      rsvp_count: 7,
      status: 'active',
    },
    {
      id: 'mock-semba',
      title: 'Semba & Friends',
      start_datetime: at(3, 19, 30),
      end_datetime: at(3, 23),
      city: 'Mont-de-Marsan',
      dance_types: [{ id: '6', slug: 'semba', label_fr: 'Semba' }],
      rsvp_count: 6,
      status: 'active',
    },
    {
      id: 'mock-wcs',
      title: 'West Coast Swing Social',
      start_datetime: at(1, 19),
      end_datetime: at(1, 22),
      city: 'Bayonne',
      dance_types: [{ id: '5', slug: 'west-coast-swing', label_fr: 'West Coast Swing' }],
      rsvp_count: 5,
      status: 'active',
    },
    {
      id: 'mock-euskadi-1',
      title: 'SBK Donostia',
      start_datetime: at(2, 23),
      end_datetime: at(3, 3),
      city: 'Donostia',
      dance_types: [
        { id: '1', slug: 'salsa', label_fr: 'Salsa' },
        { id: '2', slug: 'bachata', label_fr: 'Bachata' },
      ],
      rsvp_count: 20,
      status: 'active',
    },
    {
      id: 'mock-euskadi-2',
      title: 'Latin Night Irun',
      start_datetime: at(3, 22),
      end_datetime: at(4, 2),
      city: 'Irun',
      dance_types: [
        { id: '1', slug: 'salsa', label_fr: 'Salsa' },
        { id: '3', slug: 'kizomba', label_fr: 'Kizomba' },
      ],
      rsvp_count: 15,
      status: 'active',
    },
    {
      id: 'mock-euskadi-3',
      title: 'Bachata Hondarribia',
      start_datetime: at(0, 21, 30),
      end_datetime: at(1, 1),
      city: 'Hondarribia',
      dance_types: [{ id: '2', slug: 'bachata', label_fr: 'Bachata' }],
      rsvp_count: 12,
      status: 'active',
    },
    {
      id: 'mock-euskadi-4',
      title: 'Fiesta Latina Irun',
      start_datetime: at(1, 22),
      end_datetime: at(2, 2),
      city: 'Irun',
      dance_types: [{ id: '1', slug: 'salsa', label_fr: 'Salsa' }],
      rsvp_count: 10,
      status: 'active',
    },
  ];
}
