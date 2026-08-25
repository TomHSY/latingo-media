/**
 * Offline Thursday lens preview — mock API data, local PNGs only.
 * Run with: npm run render:thursday-preview-mock
 */
import 'dotenv/config';
import { runThursdayPipeline } from './thursday-pipeline';

async function main() {
  process.env.THURSDAY_MOCK = 'true';
  process.env.THURSDAY_LOCAL_ONLY = 'true';
  process.env.DRY_RUN = 'true';

  const result = await runThursdayPipeline({ publish: false });

  if (result.skipped) {
    process.exit(0);
  }

  console.log('\n✅ Mock preview complete. Open PNGs under output/thursday/');
}

main().catch((err) => {
  console.error('❌ Mock preview failed:', err);
  process.exit(1);
});
