/**
 * Runs publish-stories-today when schedule matches (daily 12:00 Europe/Paris)
 * or when FORCE_PUBLISH=stories.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import 'dotenv/config';
import { getParisDateTime } from '../utils/paris-time';
import { shouldRunStories } from '../utils/schedule';

const force = process.env.FORCE_PUBLISH === 'stories';

if (!force && !shouldRunStories()) {
  const paris = getParisDateTime();
  console.log(
    `⏭ Skipping stories — Paris time is ${paris.hour}:00 (need 12:00). Set FORCE_PUBLISH=stories to override.`
  );
  process.exit(0);
}

console.log(force ? '🚀 Force-running daily stories publish...\n' : '🚀 Scheduled stories publish (12:00 Paris)...\n');

const result = spawnSync(
  'npx',
  ['tsx', '--use-system-ca', path.join(__dirname, 'publish-stories-today.ts')],
  { stdio: 'inherit', env: process.env, shell: true, cwd: path.resolve(__dirname, '..', '..') }
);

process.exit(result.status ?? 1);
