/**
 * Cross-platform tsx launcher.
 * --use-system-ca is only supported on Windows/macOS (local dev TLS for api.latingo.fr).
 * Linux CI uses the default CA bundle — passing the flag causes Node to exit with code 9.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

export function runTsxScript(scriptPath, options = {}) {
  const { args = [], env = process.env, cwd = repoRoot } = options;

  const tsxArgs = ['tsx'];
  if (process.platform === 'win32' || process.platform === 'darwin') {
    tsxArgs.push('--use-system-ca');
  }
  // Relative path: Windows `shell: true` splits unquoted absolute paths on spaces
  // (this repo lives under `Projets perso`).
  const absScript = path.resolve(repoRoot, scriptPath);
  const relScript = path.relative(cwd, absScript).split(path.sep).join('/');
  tsxArgs.push(relScript, ...args);

  return spawnSync('npx', tsxArgs, {
    stdio: 'inherit',
    env,
    cwd,
    shell: true,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const script = process.argv[2];
  if (!script) {
    console.error('Usage: node scripts/run-tsx.mjs <entry-script> [args...]');
    process.exit(1);
  }

  const result = runTsxScript(path.resolve(repoRoot, script), {
    args: process.argv.slice(3),
  });
  process.exit(result.status ?? 1);
}
