/**
 * Manual Thursday publish — founder must trigger via workflow_dispatch.
 * Never scheduled with DRY_RUN=false.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import 'dotenv/config';

const repoRoot = path.resolve(__dirname, '..', '..');
const runTsx = path.join(repoRoot, 'scripts', 'run-tsx.mjs');
const publishScript = path.join(__dirname, 'publish-thursday-if-approved.ts');

const force = process.env.FORCE_PUBLISH === 'thursday';

if (!force) {
  console.error(
    '❌ Thursday publish requires manual approval. Use workflow_dispatch with job=thursday or FORCE_PUBLISH=thursday.'
  );
  process.exit(1);
}

console.log('🚀 Founder-approved Thursday publish...\n');

const dryRun = process.env.DRY_RUN === 'true';
if (dryRun) {
  console.error('❌ DRY_RUN must be false for Thursday publish.');
  process.exit(1);
}

const result = spawnSync(process.execPath, [runTsx, publishScript], {
  stdio: 'inherit',
  env: { ...process.env, DRY_RUN: 'false', FORCE_PUBLISH: 'thursday' },
  cwd: repoRoot,
});

process.exit(result.status ?? 1);
