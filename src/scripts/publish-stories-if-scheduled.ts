/**
 * Runs publish-stories-today when schedule matches (daily 12:00 Europe/Paris)
 * or when FORCE_PUBLISH=stories.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import 'dotenv/config';
import { getParisDateTime } from '../utils/paris-time';
import { shouldRunStories } from '../utils/schedule';

const repoRoot = path.resolve(__dirname, '..', '..');
const runTsx = path.join(repoRoot, 'scripts', 'run-tsx.mjs');
const publishStoriesToday = path.join(__dirname, 'publish-stories-today.ts');

const force = process.env.FORCE_PUBLISH === 'stories';

if (!force && !shouldRunStories()) {
  const paris = getParisDateTime();
  console.log(
    `⏭ Skipping stories — Paris time is ${paris.hour}:00 (need 12:00). Set FORCE_PUBLISH=stories to override.`
  );
  process.exit(0);
}

  console.log(force ? '🚀 Force-running daily stories publish...\n' : '🚀 Scheduled stories publish (10:00–18:00 Paris window)...\n');

const result = spawnSync(process.execPath, [runTsx, publishStoriesToday], {
  stdio: 'inherit',
  env: process.env,
  cwd: repoRoot,
});

process.exit(result.status ?? 1);
