/**
 * Runs publish:real when schedule matches (Tue 14:00 Europe/Paris)
 * or when FORCE_PUBLISH=carousel.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import 'dotenv/config';
import { getParisDateTime } from '../utils/paris-time';
import { shouldRunCarousel } from '../utils/schedule';

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
  'npx',
  ['tsx', '--use-system-ca', path.join(__dirname, 'publish-real.ts')],
  {
    stdio: 'inherit',
    env: { ...process.env, CAROUSEL_ONLY: 'true' },
    shell: true,
    cwd: path.resolve(__dirname, '..', '..'),
  }
);

process.exit(result.status ?? 1);
