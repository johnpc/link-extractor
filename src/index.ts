#!/usr/bin/env node
import { readFileSync, readdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
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

const profilePath = join(homedir(), 'Library/Application Support/Firefox/Profiles');
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
