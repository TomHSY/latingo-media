import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const LOGO_URL = 'https://www.latingo.fr/images/latingo-logo.png';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(
    /src="(?:https:\/\/www\.latingo\.fr\/images\/latingo-logo\.png|data:image\/png;base64,[^"]+)"/,
    `src="${LOGO_URL}"`,
  );
  fs.writeFileSync(filePath, html);
}

console.log(`Set hosted logo URL in ${files.length} HTML files: ${LOGO_URL}`);
