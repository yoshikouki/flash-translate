# Privacy Policy for Flash Translate

**Last Updated: November 26, 2026**

## Overview

Flash Translate is committed to protecting your privacy. This extension uses Chrome's built-in Translator and Language Detector APIs to translate on your device. The text you translate and its translations are never sent to external servers. Your settings are stored with Chrome's extension sync storage, described below.

## Data Collection and Usage

### Data We Access

- **Selected Text**: When you select text on an HTTPS webpage, the extension reads that text to provide translation. This text is processed locally on your device using Chrome's built-in Translator and Language Detector APIs.
- **Current Page Address**: The extension compares the address of the page you are viewing with your exclusion rules on your device to decide whether to translate there. When you open the extension popup, it reads that page's site address so you can exclude the site. A site address is stored only when you add it as an exclusion, from the popup or from the translation card.

### Data We Store

- **Language Preferences**: Your source and target languages, and whether to auto-detect the source language and skip text already in the target language, are stored in `chrome.storage.sync` to maintain your preferences across devices where you're signed into Chrome.
- **Site Exclusion Settings**: The exclusion rules you add or edit are stored in `chrome.storage.sync`.

When Chrome Sync is on, Chrome syncs these settings across your signed-in browsers according to your Chrome Sync settings. Flash Translate itself does not send them anywhere.

### Data We DO NOT Collect

- We do NOT collect personal information
- We do NOT use analytics or tracking services
- We do NOT send your text or translations to external servers
- We do NOT keep a translation history
- We do NOT share any data with third parties

## How Translation Works

Flash Translate relies on Chrome's built-in Translator API, which is designed to perform translation on-device without transmitting user text to external servers.

## Permissions Explained

- **Content script on HTTPS sites**: Required to read the text you select and display the translation card on the page
- **`activeTab`**: Chrome grants temporary access to the current tab when you click the extension's toolbar button. The access ends when you navigate to another site or close the tab.
- **`storage`**: Required to save your language preferences and sync them across your Chrome browsers

## Data Retention

- Settings remain in Chrome's sync storage until you change them or uninstall the extension
- While a page is open, selected text, hovered words, and their translations stay in memory so the card can show and reuse them. They are discarded when the page is closed or reloaded and are never written to storage

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
- Delete individual site exclusion rules in the extension settings
- Remove all stored settings by uninstalling the extension
- Review the source code at https://github.com/yoshikouki/flash-translate
