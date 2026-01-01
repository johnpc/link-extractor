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

This will output one URL per line.

## Requirements

- macOS (uses Firefox profile path at `~/Library/Application Support/Firefox/Profiles`)
- Firefox browser with at least one profile

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
