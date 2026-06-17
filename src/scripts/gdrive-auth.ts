/**
 * One-time OAuth2 flow for Google Drive.
 * Opens a browser for you to log in, then prints a refresh token to add to .env.
 *
 * Run: npx tsx src/scripts/gdrive-auth.ts
 */
import 'dotenv/config';
import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = 'http://localhost:3333/callback';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.');
    process.exit(1);
  }

  const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\n🔑 Opening browser for Google login...\n');
  console.log('If it doesn\'t open, go to:\n');
  console.log(authUrl);
  console.log('');

  // Open browser
  const { exec } = await import('child_process');
  exec(`start "" "${authUrl}"`);

  // Wait for the callback
  const code = await waitForCallback();

  // Exchange code for tokens
  const { tokens } = await oauth2.getToken(code);

  if (!tokens.refresh_token) {
    console.error('❌ No refresh token received. Try again or revoke access at https://myaccount.google.com/permissions');
    process.exit(1);
  }

  console.log('\n✅ Success! Add this to your .env file:\n');
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log('');

  process.exit(0);
}

function waitForCallback(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url!, `http://localhost:3333`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.end('Authorization failed: ' + error);
        server.close();
        reject(new Error(error));
        return;
      }

      if (code) {
        res.end('✅ Authorization successful! You can close this tab.');
        server.close();
        resolve(code);
      }
    });

    server.listen(3333, () => {
      console.log('  Waiting for Google callback on http://localhost:3333 ...\n');
    });
  });
}

main().catch((err) => {
  console.error('❌ Auth failed:', err.message);
  process.exit(1);
});
