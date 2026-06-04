import React from 'react';
import { BaseLayout } from './BaseLayout';

interface CarouselSlideLayoutProps {
  children: React.ReactNode;
  showWatermark?: boolean;
}

/**
 * Carousel slide layout — 1080×1350px (4:5 portrait).
 * Used for Instagram carousels.
 */
export function CarouselSlideLayout({ children, showWatermark = true }: CarouselSlideLayoutProps) {
  return (
    <BaseLayout format="carousel" showWatermark={showWatermark}>
      {children}
    </BaseLayout>
  );
}
