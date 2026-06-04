import React from 'react';
import { BaseLayout } from './BaseLayout';

interface SquareLayoutProps {
  children: React.ReactNode;
  showWatermark?: boolean;
}

/**
 * Square layout — 1080×1080px (1:1).
 * Used for standard Instagram/Facebook posts.
 */
export function SquareLayout({ children, showWatermark = true }: SquareLayoutProps) {
  return (
    <BaseLayout format="square" showWatermark={showWatermark}>
      {children}
    </BaseLayout>
  );
}
