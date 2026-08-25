/**
 * Publish Thursday lens after founder review.
 * Run with: DRY_RUN=false npm run publish:thursday-if-approved
 */
import 'dotenv/config';
import { runThursdayPipeline } from './thursday-pipeline';

async function main() {
  if (process.env.DRY_RUN !== 'false') {
    console.error('❌ Set DRY_RUN=false to publish Thursday lens after founder review.');
    process.exit(1);
  }

  const result = await runThursdayPipeline({ publish: true });

  if (result.skipped) {
    console.log('Nothing to publish.');
    process.exit(0);
  }

  console.log('\n✅ Thursday publish complete.');
}

main().catch((err) => {
  console.error('❌ Thursday publish failed:', err);
  process.exit(1);
});
