import React from 'react';
import { BaseLayout } from './BaseLayout';

interface StoryLayoutProps {
  children: React.ReactNode;
  showWatermark?: boolean;
}

/**
 * Story layout — 1080×1920px (9:16 portrait).
 * Used for Instagram/Facebook stories.
 */
export function StoryLayout({ children, showWatermark = true }: StoryLayoutProps) {
  return (
    <BaseLayout format="story" showWatermark={showWatermark}>
      {children}
    </BaseLayout>
  );
}
