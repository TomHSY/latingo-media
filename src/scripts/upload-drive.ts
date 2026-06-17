/**
 * Upload an existing output folder to Google Drive.
 * Usage: npx tsx --use-system-ca src/scripts/upload-drive.ts 2026-06-01
 */
import path from 'path';
import 'dotenv/config';
import { uploadToDrive } from '../publisher/gdrive';

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('❌ Usage: npx tsx --use-system-ca src/scripts/upload-drive.ts 2026-06-01');
    process.exit(1);
  }

  const weekStart = new Date(arg + 'T00:00:00');
  if (isNaN(weekStart.getTime())) {
    console.error('❌ Invalid date.');
    process.exit(1);
  }

  const folderName = `week-${weekStart.toISOString().slice(0, 10)}`;
  const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'output', folderName);

  console.log(`☁️  Uploading output/${folderName}/ to Google Drive...\n`);
  const driveUrl = await uploadToDrive(OUTPUT_DIR, folderName);
  console.log(`\n✅ Done! ${driveUrl}`);
}

main().catch((err) => {
  console.error('❌ Upload failed:', err);
  process.exit(1);
});
