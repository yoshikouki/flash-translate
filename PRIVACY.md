# Privacy Policy for Flash Translate

**Last Updated: December 20, 2025**

## Overview

Flash Translate is committed to protecting your privacy. This extension uses Chrome's built-in Translator API to provide on-device translation without sending your data to external servers.

## Data Collection and Usage

### Data We Access

- **Selected Text**: When you select text on a webpage, the extension reads that text to provide translation. This text is processed locally on your device using Chrome's built-in Translator API.
- **Active Tab**: The extension requires access to the current tab to detect text selection and display the translation popup.

### Data We Store

- **Language Preferences**: Your source and target language settings are stored in `chrome.storage.sync` to maintain your preferences across devices where you're signed into Chrome.
- **Site Exclusion Settings**: URL patterns for sites where you've disabled translation are stored in `chrome.storage.sync` and synced across devices where you're signed into Chrome.

### Data We DO NOT Collect

- We do NOT collect, transmit, or store any personal information
- We do NOT use analytics or tracking services
- We do NOT send your text or translations to external servers
- We do NOT share any data with third parties

## How Translation Works

Flash Translate relies on Chrome's built-in Translator API, which is designed to perform translation on-device without transmitting user text to external servers.

## Permissions Explained

- **`activeTab`**: Required to read selected text on the current page and display the translation popup
- **`storage`**: Required to save your language preferences and sync them across your Chrome browsers

## Data Retention

- Language preferences are stored indefinitely in Chrome's sync storage until you change them or uninstall the extension
- No translation history or text content is retained after translation

## Third-Party Services

This extension does NOT use any third-party services, APIs, or analytics tools. All functionality is provided through Chrome's built-in APIs.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date above.

## Contact

If you have questions or concerns about this privacy policy, please open an issue on our GitHub repository:
https://github.com/yoshikouki/flash-translate/issues

## Your Rights

You can:
- Stop using the extension at any time by disabling or uninstalling it
- Clear your stored preferences by resetting the extension settings
- Review the source code at https://github.com/yoshikouki/flash-translate
