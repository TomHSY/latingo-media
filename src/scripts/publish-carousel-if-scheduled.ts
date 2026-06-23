/**
 * Runs publish:real when schedule matches (Tue 14:00 Europe/Paris)
 * or when FORCE_PUBLISH=carousel.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import 'dotenv/config';
import { getParisDateTime } from '../utils/paris-time';
import { shouldRunCarousel } from '../utils/schedule';

const repoRoot = path.resolve(__dirname, '..', '..');
const runTsx = path.join(repoRoot, 'scripts', 'run-tsx.mjs');
const publishReal = path.join(__dirname, 'publish-real.ts');

const force = process.env.FORCE_PUBLISH === 'carousel';

if (!force && !shouldRunCarousel()) {
  const paris = getParisDateTime();
  console.log(
    `⏭ Skipping carousel — Paris time is ${paris.weekday} ${paris.hour}:00 (need Tue 14:00). Set FORCE_PUBLISH=carousel to override.`
  );
  process.exit(0);
}

console.log(force ? '🚀 Force-running carousel publish...\n' : '🚀 Scheduled carousel publish (Tue 14:00 Paris)...\n');

const result = spawnSync(
  process.execPath,
  [runTsx, publishReal],
  {
    stdio: 'inherit',
    env: { ...process.env, CAROUSEL_ONLY: 'true' },
    cwd: repoRoot,
  }
);

process.exit(result.status ?? 1);
