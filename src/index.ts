#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';
import { Command } from 'commander';
import lz4 from 'lz4-napi';

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

const program = new Command();

program
  .name('link-extractor')
  .description('Extract URLs from currently open Firefox tabs')
  .option('-p, --profile-path <path>', 'Custom Firefox profile path')
  .parse();

const options = program.opts<{ profilePath?: string }>();

function getDefaultProfilePath(): string {
  const os = platform();
  const home = homedir();

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

const profilePath = options.profilePath || getDefaultProfilePath();

if (!existsSync(profilePath)) {
  console.error(`Profile path not found: ${profilePath}`);
  process.exit(1);
}

const profiles = readdirSync(profilePath).filter((p) => p.includes('default-release'));

if (profiles.length === 0) {
  console.error('No Firefox profile found');
  process.exit(1);
}

const sessionFile = join(profilePath, profiles[0], 'sessionstore-backups/recovery.jsonlz4');
const buffer = readFileSync(sessionFile);

const decompressed = lz4.uncompressSync(buffer.slice(8));
const session = JSON.parse(decompressed.toString()) as Session;

session.windows.forEach((win) => {
  win.tabs.forEach((tab) => {
    const entries = tab.entries || [];
    if (entries.length > 0) {
      console.log(entries[entries.length - 1].url);
    }
  });
});
