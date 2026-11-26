# Flash Translate

[![Demo Video](https://img.youtube.com/vi/KhFbv0te2Ck/maxresdefault.jpg)](https://www.youtube.com/watch?v=KhFbv0te2Ck)

A Chrome extension that translates selected text on the page using the browser's built-in Translator API.

## Features

- **Translation on text selection**: Select text on HTTPS pages to see its translation in a card on the page
- **Auto-detect source language**: Automatically detects the language of selected text using Chrome's Language Detection API
- **Word lookup inside the selection**: Hover a word in the selected text to see its translation in the card
- **Handles long text**: Translate large paragraphs as often as you like
- **Site exclusion**: Disable translation on specific websites
- **Settings sync**: Your preferences sync across devices when Chrome Sync is on
- **Privacy-focused**: Translation runs on-device using Chrome's built-in AI, and the extension sends your text to no server

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

Flash Translate translates on your device using Chrome's built-in Translator API and sends your text to no server. See [PRIVACY.md](PRIVACY.md) for what the extension reads and stores.

## License

MIT
