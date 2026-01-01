#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';
import { Command } from 'commander';
import lz4 from 'lz4-napi';
import Database from 'better-sqlite3';
// @ts-ignore
import snappy from 'snappy';

interface TabEntry {
  url: string;
}

interface Tab {
  entries?: TabEntry[];
}

interface Window {
  tabs: Tab[];
}

interface Session {
  windows: Window[];
}

type Browser = 'firefox' | 'chrome' | 'safari';

const program = new Command();

program
  .name('link-extractor')
  .description('Extract URLs from currently open browser tabs')
  .option('-p, --profile-path <path>', 'Custom browser profile path')
  .option('-b, --browser <browser>', 'Browser to extract from (firefox, chrome, safari)', 'firefox')
  .parse();

const options = program.opts<{ profilePath?: string; browser: string }>();

const browser = options.browser.toLowerCase() as Browser;
if (!['firefox', 'chrome', 'safari'].includes(browser)) {
  console.error(`Invalid browser: ${options.browser}. Must be one of: firefox, chrome, safari`);
  process.exit(1);
}

function getDefaultProfilePath(browserType: Browser): string {
  const os = platform();
  const home = homedir();

  if (browserType === 'safari') {
    if (os !== 'darwin') {
      throw new Error('Safari is only available on macOS');
    }
    return join(home, 'Library/Safari');
  }

  if (browserType === 'chrome') {
    switch (os) {
      case 'darwin':
        return join(home, 'Library/Application Support/Google/Chrome');
      case 'win32':
        return join(home, 'AppData/Local/Google/Chrome/User Data');
      case 'linux':
        return join(home, '.config/google-chrome');
      default:
        throw new Error(`Unsupported platform: ${os}`);
    }
  }

  // Firefox
  switch (os) {
    case 'darwin':
      return join(home, 'Library/Application Support/Firefox/Profiles');
    case 'win32':
      return join(home, 'AppData/Roaming/Mozilla/Firefox/Profiles');
    case 'linux':
      return join(home, '.mozilla/firefox');
    default:
      throw new Error(`Unsupported platform: ${os}`);
  }
}

function extractFirefoxTabs(profilePath: string): string[] {
  const profiles = readdirSync(profilePath).filter((p) => p.includes('default-release'));

  if (profiles.length === 0) {
    throw new Error('No Firefox profile found');
  }

  const sessionFile = join(profilePath, profiles[0], 'sessionstore-backups/recovery.jsonlz4');
  const buffer = readFileSync(sessionFile);

  const decompressed = lz4.uncompressSync(buffer.slice(8));
  const session = JSON.parse(decompressed.toString()) as Session;

  const urls: string[] = [];
  session.windows.forEach((win) => {
    win.tabs.forEach((tab) => {
      const entries = tab.entries || [];
      if (entries.length > 0) {
        urls.push(entries[entries.length - 1].url);
      }
    });
  });

  return urls;
}

function extractSafariTabs(profilePath: string): string[] {
  const dbPath = join(profilePath, 'BrowserState.db');
  const db = new Database(dbPath, { readonly: true });

  const rows = db
    .prepare(
      `SELECT url FROM tabs WHERE url IS NOT NULL AND url != '' ORDER BY last_viewed_time DESC`
    )
    .all() as Array<{ url: string }>;

  db.close();
  return rows.map((row) => row.url);
}

function extractChromeTabs(profilePath: string): string[] {
  const sessionPath = join(profilePath, 'Default/Current Tabs');

  if (!existsSync(sessionPath)) {
    throw new Error('Chrome session file not found. Make sure Chrome is running.');
  }

  const buffer = readFileSync(sessionPath);
  const decompressed = snappy.uncompressSync(buffer) as Buffer;
  const content = decompressed.toString();

  const urls: string[] = [];
  const urlRegex = /https?:\/\/[^\s"<>]+/g;
  const matches = content.match(urlRegex);

  if (matches) {
    // Deduplicate URLs
    return [...new Set(matches)];
  }

  return urls;
}

try {
  const profilePath = options.profilePath || getDefaultProfilePath(browser);

  if (!existsSync(profilePath)) {
    console.error(`Profile path not found: ${profilePath}`);
    process.exit(1);
  }

  let urls: string[];

  switch (browser) {
    case 'firefox':
      urls = extractFirefoxTabs(profilePath);
      break;
    case 'safari':
      urls = extractSafariTabs(profilePath);
      break;
    case 'chrome':
      urls = extractChromeTabs(profilePath);
      break;
  }

  urls.forEach((url) => console.log(url));
} catch (error) {
  console.error(`Error: ${(error as Error).message}`);
  process.exit(1);
}
