/**
 * Upload a folder to Google Drive.
 * Uses OAuth2 (user's own Google account) for authentication.
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Get an auth client. Prefer a service account key in `secrets/google-service-account.json`
 * if present or if `GOOGLE_USE_SERVICE_ACCOUNT=true`. Otherwise fall back to OAuth2
 * using a refresh token.
 */
async function getAuth() {
  const serviceKeyEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const serviceKeyPath = serviceKeyEnv || path.resolve(__dirname, '..', '..', 'secrets', 'google-service-account.json');

  // Only use service account if explicitly enabled via env var AND key file exists.
  const useServiceAccount = process.env.GOOGLE_USE_SERVICE_ACCOUNT === 'true' && fs.existsSync(serviceKeyPath);

  if (useServiceAccount) {
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceKeyPath,
      scopes: SCOPES,
    });
    return await auth.getClient();
  }

  // Fallback to OAuth2 user flow
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google credentials. Either set GOOGLE_USE_SERVICE_ACCOUNT=true and provide secrets/google-service-account.json,\n' +
      'or set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN in .env (run: npx tsx src/scripts/gdrive-auth.ts).'
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

/**
 * Create a subfolder inside a parent folder.
 * Returns the new folder's ID.
 */
async function createFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId: string
): Promise<string> {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
    supportsAllDrives: true,
  });
  return res.data.id!;
}

/**
 * Upload a single file to a Drive folder.
 * Returns the file's web view link.
 */
async function uploadFile(
  drive: ReturnType<typeof google.drive>,
  filePath: string,
  folderId: string
): Promise<string> {
  const fileName = path.basename(filePath);
  const mimeType = fileName.endsWith('.png') ? 'image/png' : fileName.endsWith('.txt') ? 'text/plain' : 'application/octet-stream';

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: fs.createReadStream(filePath),
    },
    fields: 'id, webViewLink',
    supportsAllDrives: true,
  });

  return res.data.webViewLink || res.data.id!;
}

/**
 * Upload an entire output folder (carousel/ + stories/ + caption.txt) to Google Drive.
 * Creates a subfolder with the week name inside the target parent folder.
 * Returns the URL of the created Drive folder.
 */
export async function uploadToDrive(outputDir: string, folderName: string): Promise<string> {
  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!parentFolderId) {
    throw new Error('Missing GOOGLE_DRIVE_FOLDER_ID in .env');
  }

  const authClient = await getAuth();
  const drive = google.drive({ version: 'v3', auth: authClient });

  // Create week folder
  console.log(`  Creating Drive folder: ${folderName}...`);
  const weekFolderId = await createFolder(drive, folderName, parentFolderId);

  // Upload carousel/
  const carouselDir = path.join(outputDir, 'carousel');
  if (fs.existsSync(carouselDir)) {
    const carouselFolderId = await createFolder(drive, 'carousel', weekFolderId);
    const files = fs.readdirSync(carouselDir).filter((f) => f.endsWith('.png'));
    for (const file of files.sort()) {
      console.log(`  ↑ carousel/${file}`);
      await uploadFile(drive, path.join(carouselDir, file), carouselFolderId);
    }
  }

  // Upload stories/
  const storiesDir = path.join(outputDir, 'stories');
  if (fs.existsSync(storiesDir)) {
    const storiesFolderId = await createFolder(drive, 'stories', weekFolderId);
    const files = fs.readdirSync(storiesDir).filter((f) => f.endsWith('.png'));
    for (const file of files.sort()) {
      console.log(`  ↑ stories/${file}`);
      await uploadFile(drive, path.join(storiesDir, file), storiesFolderId);
    }
  }

  // Upload caption.txt
  const captionPath = path.join(outputDir, 'caption.txt');
  if (fs.existsSync(captionPath)) {
    console.log(`  ↑ caption.txt`);
    await uploadFile(drive, captionPath, weekFolderId);
  }

  const folderUrl = `https://drive.google.com/drive/folders/${weekFolderId}`;
  return folderUrl;
}
