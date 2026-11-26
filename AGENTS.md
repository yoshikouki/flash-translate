# Flash Translate Agent Guide

This file is the canonical guidance for AI coding agents working in this
repository. Tool-specific instruction files should link to this file instead of
duplicating its contents.

## Project Overview

Flash Translate is a Manifest V3 Chrome extension for on-device translation
with Chrome's built-in Translator and Language Detector APIs. It translates
selected text in a page-injected card and provides language and exclusion
settings through the extension popup.

The supported Chrome floor is `minimum_chrome_version` in `src/manifest.ts`.
The Translator and Language Detector APIs exist only in desktop Chrome 138 and
later, so that value cannot go lower.

## Working in the Repository

Scripts live in `package.json`; Ultracite and Biome configuration is the source
of truth for mechanically checkable style rules. Do not duplicate either in
agent instructions.

To test the extension manually, follow "Manual Installation" in `README.md`.

## Contracts

- Settings persist in `chrome.storage.sync` under the key defined in
  `src/shared/storage/settings.ts`. Users' synced data outlives any commit:
  `validateSettings` silently drops fields it does not recognize, so renaming
  the key or changing a field's shape resets those settings for existing users
  unless the change migrates the stored value.
- Validate values read from extension storage at that boundary before exposing
  them to consumers.
- `PRIVACY.md` is the published privacy policy. Changing manifest permissions,
  content-script matches, or what data is stored or transmitted requires
  updating it in the same change. The popup asks the content script for the
  page URL so the extension does not need the `tabs` permission.
- Translator and Language Detector lifecycles belong to their managers in
  `src/shared/utils/`; components and hooks consume those abstractions rather
  than creating browser API instances directly.

## Implementation Constraints

- Keep browser and DOM side effects at integration boundaries. Extract
  validation, transformation, and decision logic into adjacent pure modules.
- Use small structural interfaces such as `RectLike` when a pure function does
  not need a concrete DOM type.
- React Compiler is enabled. Do not add `useMemo`, `useCallback`, or `memo`
  solely for routine memoization; use them only when a concrete semantic or
  measured performance requirement remains.

## Testing

Prefer pure-function tests over mocks of React, the DOM, or Chrome APIs.

- Co-locate extracted logic and its test, for example `foo.ts` and
  `foo.test.ts`.
- Add integration-style tests only when behavior cannot be expressed through a
  stable pure contract.
- Run `bun run lint` and `bun run test` before committing code changes. Run
  `bun run build` when changing extension entry points, manifests, build
  configuration, or browser API integration.

## Release

1. Bump `version` in `package.json`; the manifest reads it.
2. After the bump is on `main`, push the tag `v<version>`.
   `.github/workflows/release.yml` builds the ZIP and publishes a GitHub
   Release. Only a tag push checks the tag against `package.json`; a manual
   dispatch does not.
3. This repository does not publish to the Chrome Web Store. Publishing the
   ZIP there is the owner's decision.
