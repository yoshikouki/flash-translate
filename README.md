# Flash Translate

[![Demo Video](https://img.youtube.com/vi/KhFbv0te2Ck/maxresdefault.jpg)](https://www.youtube.com/watch?v=KhFbv0te2Ck)

A Chrome extension for instant translation using the browser's built-in Translator API.

## Features

- **Instant translation on text selection**: Select text on HTTPS pages to view translations immediately
- **Auto-detect source language**: Automatically detects the language of selected text using Chrome's Language Detection API
- **Word lookup inside the selection**: Hover a word in the selected text to see its translation in the card
- **Handles long text**: Translate large paragraphs as often as you like
- **Site exclusion**: Disable translation on specific websites
- **Settings sync**: Your preferences sync automatically across devices
- **Privacy-focused**: All translation happens on-device using Chrome's built-in AI - your text is never sent to external servers

## Requirements

- Desktop Chrome 150 or later

## Installation

### Chrome Web Store

[**Install Flash Translate**](https://chromewebstore.google.com/detail/gibfhkdnpbinchfllkhaihmghbbollfd)

### Manual Installation (Development)

1. Run `bun run dev` or `bun run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

## Development

Run `bun install`, then use the scripts in `package.json`. Development
conventions are in [AGENTS.md](AGENTS.md).

## Privacy

Flash Translate respects your privacy. All translation is performed locally on your device using Chrome's built-in Translator API. The text you translate is never sent to external servers. See [PRIVACY.md](PRIVACY.md) for details.

## License

MIT
