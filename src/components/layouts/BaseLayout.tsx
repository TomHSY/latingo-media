import React from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { colors, typography, fontImportUrl } from '../../tokens/noche';
import type { MediaFormat } from '../../types';
import { DIMENSIONS } from '../../types';

// Load logo as base64 at import time for reliable embedding
const logoPath = path.resolve(__dirname, '..', '..', 'assets', 'icon-text.png');
const logoBase64 = fs.existsSync(logoPath)
  ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
  : '';

interface BaseLayoutProps {
  format: MediaFormat;
  children: React.ReactNode;
  showWatermark?: boolean;
}

/**
 * Base layout wrapper for all media templates.
 * Sets exact dimensions, background, font, and optional LatinGo watermark.
 */
export function BaseLayout({ format, children, showWatermark = true }: BaseLayoutProps) {
  const { width, height } = DIMENSIONS[format];

  return (
    <html>
      <head>
        <link rel="stylesheet" href={fontImportUrl} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                width: ${width}px; 
                height: ${height}px; 
                overflow: hidden;
                font-family: ${typography.fontFamily};
                background: ${colors.bg};
                color: ${colors.text};
                -webkit-font-smoothing: antialiased;
              }
            `,
          }}
        />
      </head>
      <body>
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {children}

          {showWatermark && (
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '0',
                right: '0',
                display: 'flex',
                justifyContent: 'center',
                opacity: 0.9,
              }}
            >
              <img
                src={logoBase64}
                style={{ height: '200px' }}
                alt="LatinGo"
              />
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
