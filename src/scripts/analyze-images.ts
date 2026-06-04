import 'dotenv/config';

const urls = [
  'https://pub-0a74468ba5af4a029f562126cdb5944f.r2.dev/events/4d08aaa1-4363-463b-9cdb-9c23da443ce4.jpg',
  'https://pub-0a74468ba5af4a029f562126cdb5944f.r2.dev/events/ae05eb51-4856-4051-8dbb-40dbccaf8f87.jpg',
  'https://pub-0a74468ba5af4a029f562126cdb5944f.r2.dev/events/d7720d16-def5-4ce7-b42b-0f89dcddb679.jpg',
  'https://pub-0a74468ba5af4a029f562126cdb5944f.r2.dev/events/954bf587-4bb3-4987-9140-ef091fa2fc32.jpg',
  'https://pub-0a74468ba5af4a029f562126cdb5944f.r2.dev/events/ce6f438b-3a54-46c3-bfa3-51b2dcbbc8a8.jpg',
];

function jpegSize(buf: Buffer) {
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      return { width: w, height: h };
    }
    i += 2 + len;
  }
  return null;
}

async function main() {
  console.log('📸 Analyzing image dimensions...\n');
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const buf = Buffer.from(await res.arrayBuffer());
      const dims = jpegSize(buf);
      const name = url.split('/').pop()!.slice(0, 36);
      const sizeKB = (buf.length / 1024).toFixed(0);
      const ratio = dims ? (dims.width / dims.height).toFixed(2) : '?';
      console.log(`  ${name}`);
      console.log(`    ${dims ? `${dims.width}×${dims.height}` : 'unknown'} | ${sizeKB}KB | ratio: ${ratio}`);
      console.log('');
    } catch (err: any) {
      console.log(`  ❌ ${err.message}`);
    }
  }
}

main();
