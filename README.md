# Flash Translate

Chrome拡張機能 - ブラウザ内蔵のTranslator APIを使った即座翻訳

## 機能

- **テキスト選択で即座翻訳**: ページ上のテキストを選択すると、選択箇所の近くにポップアップで翻訳結果を表示
- **ストリーミング翻訳**: 翻訳結果をリアルタイムで表示
- **多言語対応**: 14言語をサポート（英語、日本語、中国語、韓国語、スペイン語など）
- **設定の同期**: 言語設定はchrome.storage.syncで同期

## 必要条件

- **Chrome 138以上** (Translator APIサポート)
- **Translator APIの有効化**:
  1. `chrome://flags` を開く
  2. 「Translator API」を検索
  3. 「Enabled」に設定
  4. Chromeを再起動

## 開発

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動（HMR対応）
bun run dev

# ビルド
bun run build

# 型チェック
bun run lint
```

### 拡張機能のインストール（開発用）

1. `bun run dev` または `bun run build` を実行
2. `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `dist` フォルダを選択

## 技術スタック

- **Vite** + **@crxjs/vite-plugin** - Chrome拡張機能のビルド（HMR対応）
- **React 19** + **TypeScript** - UI
- **Tailwind CSS v4** - スタイリング
- **Chrome Translator API** - ブラウザ内蔵AI翻訳

## プロジェクト構造

```
src/
├── manifest.ts              # Chrome拡張機能マニフェスト
├── background/              # Service Worker
├── content/                 # Content Script（テキスト選択→翻訳ポップアップ）
│   ├── components/          # TranslationPopup等
│   ├── hooks/               # useTextSelection, useTranslator等
│   └── styles/
├── popup/                   # Popup UI（設定・手動翻訳）
│   ├── components/
│   └── styles/
└── shared/                  # 共有コード
    ├── constants/           # 言語リスト
    ├── storage/             # chrome.storage操作
    ├── types/               # 型定義
    └── utils/               # Translator APIラッパー
```

## ライセンス

MIT
