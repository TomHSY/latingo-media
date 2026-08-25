/**
 * Render Thursday lens preview (DRY_RUN — no Instagram publish).
 * Run with: npm run render:thursday-preview
 */
import 'dotenv/config';
import { runThursdayPipeline } from './thursday-pipeline';

async function main() {
  if (process.env.DRY_RUN !== 'false') {
    process.env.DRY_RUN = 'true';
  }

  const result = await runThursdayPipeline({ publish: false });

  if (result.skipped) {
    process.exit(0);
  }

  console.log('\n✅ Thursday preview complete. Review PNG URLs above before publishing.');
}

main().catch((err) => {
  console.error('❌ Thursday preview failed:', err);
  process.exit(1);
});
