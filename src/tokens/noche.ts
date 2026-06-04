/**
 * Noche Design System — LatinGo active theme tokens.
 * Source of truth for all media template rendering.
 */

export const colors = {
  bg: '#0F0F14',
  surface: '#1C1C24',
  raised: '#272733',
  border: '#2E2E3A',
  coral: '#FF4E3A',
  gold: '#FFB830',
  text: '#F5F0EA',
  secondary: '#9B97A3',
  muted: '#5C5968',
  tabbar: '#14141A',
  success: '#2ECC71',
  error: '#FF4E3A',
  overlay: 'rgba(0,0,0,0.65)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const typography = {
  fontFamily: "'DM Sans', sans-serif",
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  hero: {
    fontWeight: 800,
    fontSize: '34px',
    letterSpacing: '-0.5px',
    lineHeight: '40px',
  },
  h1: {
    fontWeight: 700,
    fontSize: '26px',
    letterSpacing: '-0.3px',
    lineHeight: '32px',
  },
  h2: {
    fontWeight: 700,
    fontSize: '20px',
    letterSpacing: '-0.2px',
    lineHeight: '26px',
  },
  body: {
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '22px',
  },
  caption: {
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: '18px',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
} as const;

/** Google Fonts import URL for DM Sans with all required weights */
export const fontImportUrl =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap';
