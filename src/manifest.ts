import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Flash Translate",
  version: packageJson.version,
  description: "Translate selected text instantly, without leaving the page. All processing happens on your device.",

  icons: {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },

  permissions: ["storage", "activeTab"],

  action: {
    default_popup: "src/popup/index.html",
    default_title: "Flash Translate",
    default_icon: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
    },
  },

  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },

  content_scripts: [
    {
      matches: ["https://*/*"],
      js: ["src/content/index.tsx"],
      run_at: "document_idle",
    },
  ],

  minimum_chrome_version: "138",
  homepage_url: "https://github.com/yoshikouki/flash-translate",
});
