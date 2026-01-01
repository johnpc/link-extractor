# @johnpc/link-extractor

Extract URLs from currently open browser tabs (Firefox, Chrome, Safari).

## Installation

```bash
npx @johnpc/link-extractor
```

Or install globally:

```bash
npm install -g @johnpc/link-extractor
link-extractor
```

## Usage

Extract URLs from Firefox (default):

```bash
npx @johnpc/link-extractor > tabs.txt
```

### Browser Selection

Use the `--browser` flag to specify which browser:

```bash
# Firefox (default)
npx @johnpc/link-extractor --browser firefox

# Chrome
npx @johnpc/link-extractor --browser chrome

# Safari (macOS only)
npx @johnpc/link-extractor --browser safari
```

### Custom Profile Path

Override the default browser profile path:

```bash
# macOS Firefox
npx @johnpc/link-extractor -p ~/Library/Application\ Support/Firefox/Profiles

# Linux Firefox
npx @johnpc/link-extractor -p ~/.mozilla/firefox

# Windows Firefox
npx @johnpc/link-extractor -p %APPDATA%\Mozilla\Firefox\Profiles

# macOS Chrome
npx @johnpc/link-extractor --browser chrome -p ~/Library/Application\ Support/Google/Chrome
```

## Requirements

- One of: Firefox, Chrome, or Safari
- Supported platforms: macOS, Linux (Firefox/Chrome), Windows (Firefox/Chrome)

### Default Profile Paths

**Firefox:**
- macOS: `~/Library/Application Support/Firefox/Profiles`
- Linux: `~/.mozilla/firefox`
- Windows: `%APPDATA%\Mozilla\Firefox\Profiles`

**Chrome:**
- macOS: `~/Library/Application Support/Google/Chrome`
- Linux: `~/.config/google-chrome`
- Windows: `%APPDATA%\Local\Google\Chrome\User Data`

**Safari:**
- macOS: `~/Library/Safari` (requires Full Disk Access permission)

### Safari Permissions

On macOS, Safari extraction requires Full Disk Access:
1. Open System Settings → Privacy & Security → Full Disk Access
2. Add Terminal (or your terminal app)
3. Restart your terminal

## How it works

- **Firefox**: Reads and decompresses `recovery.jsonlz4` (LZ4 compression)
- **Chrome**: Parses `Sessions/Tabs_*` files (Chrome's SNSS session format)
- **Safari**: Queries `BrowserState.db` SQLite database

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start
```

## License

ISC
