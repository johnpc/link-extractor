# @johnpc/link-extractor

Extract URLs from currently open Firefox tabs.

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

Run the command to extract all URLs from your currently open Firefox tabs:

```bash
npx @johnpc/link-extractor > tabs.txt
```

### Custom Profile Path

Override the default Firefox profile path:

```bash
# macOS
npx @johnpc/link-extractor -p ~/Library/Application\ Support/Firefox/Profiles

# Linux
npx @johnpc/link-extractor -p ~/.mozilla/firefox

# Windows
npx @johnpc/link-extractor -p %APPDATA%\Mozilla\Firefox\Profiles
```

## Requirements

- Firefox browser with at least one profile
- Supported platforms: macOS, Linux, Windows

### Default Profile Paths

- **macOS**: `~/Library/Application Support/Firefox/Profiles`
- **Linux**: `~/.mozilla/firefox`
- **Windows**: `%APPDATA%\Mozilla\Firefox\Profiles`

## How it works

The tool reads Firefox's session recovery file (`recovery.jsonlz4`), decompresses it, and extracts the current URL from each open tab across all windows.

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
