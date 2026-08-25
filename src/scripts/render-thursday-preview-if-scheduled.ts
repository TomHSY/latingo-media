/**
 * Wed ~20:00 Paris — Thursday preview render only (DRY_RUN=true).
 */
import { spawnSync } from 'child_process';
import path from 'path';
import 'dotenv/config';
import { getParisDateTime } from '../utils/paris-time';
import { shouldRunThursdayPreview } from '../utils/schedule';

const repoRoot = path.resolve(__dirname, '..', '..');
const runTsx = path.join(repoRoot, 'scripts', 'run-tsx.mjs');
const previewScript = path.join(__dirname, 'render-thursday-preview.ts');

const force = process.env.FORCE_PUBLISH === 'thursday-preview';

if (!force && !shouldRunThursdayPreview()) {
  const paris = getParisDateTime();
  console.log(
    `⏭ Skipping Thursday preview — Paris time is ${paris.weekday} ${paris.hour}:00 (need Wed 18:00–22:00). Set FORCE_PUBLISH=thursday-preview to override.`
  );
  process.exit(0);
}

console.log(
  force
    ? '🚀 Force-running Thursday preview render...\n'
    : '🚀 Scheduled Thursday preview (Wed 18:00–22:00 Paris window)...\n'
);

const result = spawnSync(process.execPath, [runTsx, previewScript], {
  stdio: 'inherit',
  env: { ...process.env, DRY_RUN: 'true' },
  cwd: repoRoot,
});

process.exit(result.status ?? 1);
