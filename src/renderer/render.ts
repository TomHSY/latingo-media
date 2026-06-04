import { chromium, type Browser, type Page } from 'playwright';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import * as path from 'path';
import * as fs from 'fs';
import { DIMENSIONS, type MediaFormat } from '../types';

let browser: Browser | null = null;

/**
 * Get or create a shared browser instance.
 */
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

/**
 * Close the shared browser instance.
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export interface RenderOptions {
  /** The React element to render (must include a layout wrapper) */
  element: ReactElement;
  /** Output format determines screenshot dimensions */
  format: MediaFormat;
  /** Output file path (PNG) */
  outputPath: string;
  /** Quality for JPEG (ignored for PNG). Default: undefined (PNG) */
  quality?: number;
}

/**
 * Render a React element to a PNG/JPEG image file.
 *
 * Flow:
 * 1. React element → static HTML string (server-side render)
 * 2. Load HTML in headless Chromium page
 * 3. Screenshot at exact dimensions
 * 4. Save to outputPath
 */
export async function renderToImage(options: RenderOptions): Promise<string> {
  const { element, format, outputPath, quality } = options;
  const { width, height } = DIMENSIONS[format];

  // 1. Render React to static HTML
  const html = renderToStaticMarkup(element);
  const fullHtml = `<!DOCTYPE html>${html}`;

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 2. Open page in headless browser
  const b = await getBrowser();
  const page: Page = await b.newPage();

  await page.setViewportSize({ width, height });

  // Load the HTML content
  await page.setContent(fullHtml, { waitUntil: 'networkidle' });

  // 3. Screenshot
  const isPng = outputPath.endsWith('.png');
  await page.screenshot({
    path: outputPath,
    type: isPng ? 'png' : 'jpeg',
    ...(quality && !isPng ? { quality } : {}),
    clip: { x: 0, y: 0, width, height },
  });

  await page.close();

  return outputPath;
}

/**
 * Render multiple elements in batch (reuses browser instance).
 */
export async function renderBatch(
  items: Omit<RenderOptions, 'quality'>[]
): Promise<string[]> {
  const results: string[] = [];
  for (const item of items) {
    const result = await renderToImage(item);
    results.push(result);
  }
  await closeBrowser();
  return results;
}
