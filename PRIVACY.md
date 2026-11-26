# Privacy Policy for Flash Translate

**Last Updated: November 26, 2026**

## Overview

Flash Translate translates text on your device with Chrome's built-in
Translator and Language Detector APIs. The developer of Flash Translate runs no
servers and receives no data from the extension.

## Data the Extension Handles

### Text You Select

- When you select text on an HTTPS webpage, the extension reads it and
  translates it on your device. Flash Translate does not send the text or its
  translation to any server.
- The translation card is shown inside the page you are viewing. Like the rest
  of that page, the card's contents can be read by the page's own scripts.
- While a page is open, selected text, hovered words, and their translations
  stay in memory so the card can show and reuse them. They are discarded when
  the page is closed or reloaded. The extension keeps no translation history.
- When you use the copy button, the translation is written to your system
  clipboard and stays there as long as your clipboard keeps it.

### Page Address

- On each HTTPS page, the extension compares the page's origin and path with
  your exclusion rules on your device to decide whether to show the
  translation card there. On excluded pages the extension still reads your
  selection, and may detect its language on your device, but shows no card.
- When you open the extension popup, it receives the full address of the
  current tab and keeps only its origin (for example,
  `https://example.com`) to offer excluding that site.

## Data the Extension Stores

The extension stores the following settings in `chrome.storage.sync`:

- Source and target languages, and whether to auto-detect the source language
  and skip text already in the target language
- Site exclusion rules. Rules added from the popup or the translation card
  contain only the site origin. Rules you edit are saved as you type them,
  without surrounding spaces, including any query string you enter.

When Chrome Sync is on, Chrome syncs these settings across your signed-in
browsers according to your Chrome Sync settings. The extension does not send
them anywhere itself.

## Permissions Explained

- **Content script on HTTPS sites** (`https://*/*` in the manifest): Required
  to read the text you select and display the translation card on the page
- **`activeTab`**: Chrome grants temporary access to the current tab when you
  click the extension's toolbar button. The access lasts while the tab stays
  on the same origin and ends when the tab moves to another origin or closes.
- **`storage`**: Required to save the settings listed above

## Third-Party Services

Flash Translate uses no analytics, tracking, or third-party services for
translation. All translation functionality is provided through Chrome's
built-in APIs.

The popup's support link opens a Google Form in your browser. Anything you
submit there, including an optional reply email address, is sent to Google
Forms and read by the developer to answer your request. The extension itself
sends nothing to the form.

## Your Choices

- Stop using the extension at any time by disabling or uninstalling it
- Delete individual site exclusion rules in the extension settings
- Uninstalling the extension deletes its settings from that Chrome profile.
  Whether the deletion reaches your other signed-in browsers depends on Chrome
  Sync.
- Review the source code at https://github.com/yoshikouki/flash-translate

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be
reflected in the "Last Updated" date above.

## Contact

If you have questions or concerns about this privacy policy, please open an
issue on our GitHub repository:
https://github.com/yoshikouki/flash-translate/issues
