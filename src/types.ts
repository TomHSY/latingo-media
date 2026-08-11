/**
 * Shared TypeScript types for the media engine.
 */

export interface EventDanceType {
  id: string;
  slug: string;
  label_fr: string;
}

export interface MediaEvent {
  id: string;
  title: string;
  description?: string | null;
  start_datetime: string; // ISO 8601
  end_datetime: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  city?: string | null;
  image_url?: string | null;
  source_url?: string | null;
  website_url?: string | null;
  ticket_url?: string | null;
  status?: 'active' | 'cancelled';
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  dance_types: EventDanceType[];
  rsvp_count?: number;
  view_count?: number;
  created_at?: string | null;
  is_popular?: boolean;
}

export type MediaFormat = 'carousel' | 'story' | 'square';

export interface MediaDimensions {
  width: number;
  height: number;
}

export const DIMENSIONS: Record<MediaFormat, MediaDimensions> = {
  carousel: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};
