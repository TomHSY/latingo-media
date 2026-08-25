/**
 * Build segmented store-launch email lists from Formspree, tester CSVs, and the API.
 *
 * Run: npm run merge:launch-lists
 *
 * Inputs (gitignored): tmp/launch-emails/inbox/
 * Outputs: tmp/launch-emails/*.csv + summary.json
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const API_BASE = 'https://api.latingo.fr';
const ROOT = path.resolve(__dirname, '../..');
const INBOX = path.join(ROOT, 'tmp/launch-emails/inbox');
const OUT = path.join(ROOT, 'tmp/launch-emails');

const FOUNDER_EMAIL = 'tomhadrian.sy@gmail.com';
const TEST_EMAIL = 'test@gmail.com';
const STORE_REVIEW_PREFIXES = ['applereview', 'googlereview'];

interface UserAdmin {
  id: string;
  username: string;
  email: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

interface FormRow {
  email: string;
  prenom: string;
  appareil: 'iPhone' | 'Android' | string;
  ville: string;
  source: string;
  submitted_at: string;
}

interface ExcludedRow {
  email: string;
  reason: string;
  sources: string;
}

interface OverlapRow {
  email: string;
  sources: string;
  assigned_list: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function writeCsv(filePath: string, headers: string[], rows: Record<string, string>[]): void {
  const escape = (value: string) => {
    if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
  };

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h] ?? '')).join(',')),
  ];
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
}

async function getToken(): Promise<string> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

async function fetchAdminUsers(token: string): Promise<UserAdmin[]> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`GET /admin/users failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

function loadEmailList(filePath: string, column = 'email'): string[] {
  if (!fs.existsSync(filePath)) return [];
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));
  return rows
    .map((row) => normalizeEmail(row[column] ?? ''))
    .filter(Boolean);
}

function loadFormspree(filePath: string): Map<string, FormRow> {
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));
  const byEmail = new Map<string, FormRow>();

  for (const row of rows) {
    const email = normalizeEmail(row.email ?? '');
    if (!email) continue;

    const entry: FormRow = {
      email,
      prenom: (row.prenom ?? '').trim(),
      appareil: (row.appareil ?? '').trim(),
      ville: (row.ville ?? '').trim(),
      source: (row.source ?? '').trim(),
      submitted_at: (row._date ?? '').trim(),
    };

    const existing = byEmail.get(email);
    if (!existing || entry.submitted_at > existing.submitted_at) {
      byEmail.set(email, entry);
    }
  }

  return byEmail;
}

function isStoreReviewAccount(email: string): boolean {
  const local = email.split('@')[0] ?? '';
  return STORE_REVIEW_PREFIXES.some((prefix) => local.startsWith(prefix));
}

function shouldHardExclude(email: string): string | null {
  if (email === TEST_EMAIL) return 'test submission';
  if (email === FOUNDER_EMAIL) return 'founder preview';
  if (isStoreReviewAccount(email)) return 'store review account';
  return null;
}

function testerPlatform(play: Set<string>, testflight: Set<string>, email: string): string {
  const inPlay = play.has(email);
  const inTf = testflight.has(email);
  if (inPlay && inTf) return 'both';
  if (inTf) return 'ios';
  if (inPlay) return 'android';
  return 'unknown';
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT, { recursive: true });

  const formspreePath = path.join(INBOX, 'formspree.csv');
  const playPath = path.join(INBOX, 'testers-play.csv');
  const testflightPath = path.join(INBOX, 'testers-testflight.csv');

  for (const required of [formspreePath, playPath, testflightPath]) {
    if (!fs.existsSync(required)) {
      throw new Error(`Missing input: ${required}`);
    }
  }

  const formByEmail = loadFormspree(formspreePath);
  const playEmails = new Set(loadEmailList(playPath));
  const testflightEmails = new Set(loadEmailList(testflightPath));
  const testerEmails = new Set([...playEmails, ...testflightEmails]);

  console.log('Fetching accounts from api.latingo.fr…');
  const token = await getToken();
  const users = await fetchAdminUsers(token);

  const accountByEmail = new Map<string, UserAdmin>();
  const excluded: ExcludedRow[] = [];
  const overlaps: OverlapRow[] = [];

  for (const user of users) {
    const email = normalizeEmail(user.email);
    const hardExclude = shouldHardExclude(email);
    if (hardExclude) {
      excluded.push({ email, reason: hardExclude, sources: 'account' });
      continue;
    }
    if (user.role === 'admin') {
      excluded.push({ email, reason: 'admin role', sources: 'account' });
      continue;
    }
    if (user.is_blocked) {
      excluded.push({ email, reason: 'blocked', sources: 'account' });
      continue;
    }
    accountByEmail.set(email, user);
  }

  // Hard-exclude from form/tester sources too (may not have accounts)
  for (const email of [...formByEmail.keys(), ...testerEmails]) {
    const hardExclude = shouldHardExclude(email);
    if (hardExclude && !excluded.some((e) => e.email === email)) {
      const sources: string[] = [];
      if (formByEmail.has(email)) sources.push('form');
      if (testerEmails.has(email)) sources.push('tester');
      excluded.push({ email, reason: hardExclude, sources: sources.join('+') || 'unknown' });
    }
  }

  const excludedEmails = new Set(excluded.map((e) => e.email));

  type Assignment = 'testers' | 'accounts' | 'form_ios' | 'form_android';
  const assigned = new Map<string, Assignment>();

  function sourcesFor(email: string): string[] {
    const sources: string[] = [];
    if (testerEmails.has(email)) sources.push('tester');
    if (accountByEmail.has(email)) sources.push('account');
    if (formByEmail.has(email)) sources.push('form');
    return sources;
  }

  function assign(email: string, list: Assignment): void {
    if (excludedEmails.has(email)) return;

    const sources = sourcesFor(email);
    if (sources.length > 1) {
      overlaps.push({
        email,
        sources: sources.join('+'),
        assigned_list: list,
      });
    }

    assigned.set(email, list);
  }

  // Priority: tester > account > form
  for (const email of testerEmails) {
    if (excludedEmails.has(email)) continue;
    assign(email, 'testers');
  }

  for (const [email] of accountByEmail) {
    if (excludedEmails.has(email) || assigned.has(email)) continue;
    assign(email, 'accounts');
  }

  for (const [email, form] of formByEmail) {
    if (excludedEmails.has(email) || assigned.has(email)) continue;
    const device = form.appareil.toLowerCase();
    if (device.includes('iphone') || device.includes('ios')) {
      assign(email, 'form_ios');
    } else if (device.includes('android')) {
      assign(email, 'form_android');
    } else {
      assign(email, 'form_android');
    }
  }

  const testersRows: Record<string, string>[] = [];
  const accountsRows: Record<string, string>[] = [];
  const formIosRows: Record<string, string>[] = [];
  const formAndroidRows: Record<string, string>[] = [];

  for (const [email, list] of assigned) {
    const form = formByEmail.get(email);
    const account = accountByEmail.get(email);
    const platform = testerPlatform(playEmails, testflightEmails, email);

    const base = {
      email,
      prenom: form?.prenom || account?.username || '',
      platform,
      ville: form?.ville ?? '',
    };

    switch (list) {
      case 'testers':
        testersRows.push(base);
        break;
      case 'accounts':
        accountsRows.push({
          email,
          prenom: account?.username || form?.prenom || '',
          username: account?.username ?? '',
          created_at: account?.created_at ?? '',
        });
        break;
      case 'form_ios':
        formIosRows.push(base);
        break;
      case 'form_android':
        formAndroidRows.push(base);
        break;
    }
  }

  const sortByEmail = (a: Record<string, string>, b: Record<string, string>) =>
    (a.email ?? '').localeCompare(b.email ?? '');

  testersRows.sort(sortByEmail);
  accountsRows.sort(sortByEmail);
  formIosRows.sort(sortByEmail);
  formAndroidRows.sort(sortByEmail);
  excluded.sort((a, b) => a.email.localeCompare(b.email));
  overlaps.sort((a, b) => a.email.localeCompare(b.email));

  writeCsv(path.join(OUT, 'testers.csv'), ['email', 'prenom', 'platform', 'ville'], testersRows);
  writeCsv(path.join(OUT, 'accounts.csv'), ['email', 'prenom', 'username', 'created_at'], accountsRows);
  writeCsv(path.join(OUT, 'form_ios.csv'), ['email', 'prenom', 'platform', 'ville'], formIosRows);
  writeCsv(path.join(OUT, 'form_android.csv'), ['email', 'prenom', 'platform', 'ville'], formAndroidRows);
  writeCsv(
    path.join(OUT, '_excluded.csv'),
    ['email', 'reason', 'sources'],
    excluded.map((row) => ({ email: row.email, reason: row.reason, sources: row.sources })),
  );
  writeCsv(
    path.join(OUT, 'overlap.csv'),
    ['email', 'sources', 'assigned_list'],
    overlaps.map((row) => ({
      email: row.email,
      sources: row.sources,
      assigned_list: row.assigned_list,
    })),
  );

  const summary = {
    generated_at: new Date().toISOString(),
    inputs: {
      formspree_unique: formByEmail.size,
      play_testers: playEmails.size,
      testflight_testers: testflightEmails.size,
      tester_union: testerEmails.size,
      api_users_total: users.length,
      api_users_eligible: accountByEmail.size,
    },
    outputs: {
      testers: testersRows.length,
      accounts: accountsRows.length,
      form_ios: formIosRows.length,
      form_android: formAndroidRows.length,
      excluded: excluded.length,
      overlap_audit: overlaps.length,
      total_to_mail:
        testersRows.length + accountsRows.length + formIosRows.length + formAndroidRows.length,
    },
    tester_platforms: {
      ios_only: testersRows.filter((r) => r.platform === 'ios').length,
      android_only: testersRows.filter((r) => r.platform === 'android').length,
      both: testersRows.filter((r) => r.platform === 'both').length,
    },
    overlap_by_assigned: overlaps.reduce<Record<string, number>>((acc, row) => {
      acc[row.assigned_list] = (acc[row.assigned_list] ?? 0) + 1;
      return acc;
    }, {}),
  };

  fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');

  console.log('\nLaunch email lists written to tmp/launch-emails/\n');
  console.log(`  testers.csv      ${testersRows.length}`);
  console.log(`  accounts.csv     ${accountsRows.length}`);
  console.log(`  form_ios.csv     ${formIosRows.length}`);
  console.log(`  form_android.csv ${formAndroidRows.length}`);
  console.log(`  _excluded.csv    ${excluded.length}`);
  console.log(`  overlap.csv      ${overlaps.length} (audit — not mailed)`);
  console.log(`  total to mail    ${summary.outputs.total_to_mail}`);
  console.log('\nSee summary.json for full breakdown.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
