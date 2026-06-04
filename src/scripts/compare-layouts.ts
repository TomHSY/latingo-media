import React from 'react';
import path from 'path';
import fs from 'fs';
import { renderToImage, closeBrowser } from '../renderer/render';
import { colors, typography } from '../tokens/noche';
import { CarouselSlideLayout } from '../components/layouts/CarouselSlideLayout';

const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', 'compare', 'covers');
const logoBase64 = fs.readFileSync(path.resolve(__dirname, '..', 'assets', 'icon-text.png')).toString('base64');

function cover() {
  return React.createElement(CarouselSlideLayout, { showWatermark: false },
    React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px' } },
      React.createElement('div', { style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '160px', lineHeight: '160px', color: colors.text, letterSpacing: '-4px' } }, '25-31'),
      React.createElement('div', { style: { fontFamily: typography.fontFamily, fontWeight: 800, fontSize: '160px', lineHeight: '160px', color: colors.text, letterSpacing: '-4px', marginTop: '8px' } }, 'MAI')
    ),
    React.createElement('img', { src: 'data:image/png;base64,' + logoBase64, style: { height: '280px', width: 'auto', objectFit: 'contain', opacity: 0.9, marginBottom: '80px' } })
  );
}

async function main() {
  if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  await renderToImage({ format: 'carousel', outputPath: path.join(OUTPUT_DIR, 'simple-date.png'), element: cover() });
  await closeBrowser();
  console.log('Done');
}

main().catch(err => { console.error(err); process.exit(1); });