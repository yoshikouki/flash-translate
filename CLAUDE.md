# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flash Translate is a Chrome extension that provides instant translation using the Chrome built-in Translator API. Users can select text on any webpage to see translations in a popup, or use the extension popup for manual translation.

**Requirements**: Chrome 138+ with Translator API enabled (`chrome://flags` → "Translator API" → Enabled)

## Commands

```bash
bun install         # Install dependencies
bun run dev         # Development server with HMR
bun run build       # Production build (output: dist/)
bun run lint        # ESLint type checking
```

To test the extension: Load `dist/` folder as unpacked extension in `chrome://extensions/` (Developer mode)

## Architecture

### Entry Points (Manifest V3)
- **Content Script** (`src/content/index.tsx`): Injected into all pages, renders React app in Shadow DOM for text selection → translation popup
- **Popup** (`src/popup/index.tsx`): Extension popup UI for manual translation and language settings
- **Background** (`src/background/index.ts`): Service Worker (minimal, mainly for extension lifecycle)

### Core Translation Flow
1. `useTextSelection` hook detects text selection on page
2. `TranslationPopup` component appears near selection
3. `useTranslator` hook manages translation state with streaming support
4. `TranslatorManager` singleton (`src/shared/utils/translator.ts`) wraps Chrome Translator API with:
   - Instance caching per language pair
   - Availability checking (available/after-download/unavailable/unsupported)
   - Streaming translation via async generator

### State Management
- Language settings stored in `chrome.storage.sync` (synced across devices)
- `subscribeToSettings()` provides real-time setting updates via storage change listeners
- Content script and popup share settings through `src/shared/storage/settings.ts`

### Key Abstractions
- **TranslatorManager**: Singleton managing Translator API lifecycle, handles model downloads and caching
- **useTranslator**: React hook for translation with abort support, streaming, and availability states
- **usePopupPosition**: Calculates popup position relative to text selection
- **useResizable/useDraggable**: Hooks for popup resize (left/right handles) and drag interactions

### Site Exclusion
- URL patterns stored in settings to disable translation on specific sites
- `isUrlExcluded()` checks current URL against enabled patterns
- Managed through popup's ExclusionSettings component

## Tech Stack
- Vite + @crxjs/vite-plugin (HMR-enabled Chrome extension builds)
- React 19 + TypeScript
- **React Compiler** enabled via `babel-plugin-react-compiler` (automatic memoization - no manual `useMemo`/`useCallback`/`memo` needed)
- Tailwind CSS v4
- `@types/dom-chromium-ai` for Translator API types
- Path alias: `@/` → `src/`
