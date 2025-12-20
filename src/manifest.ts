import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Flash Translate",
  version: packageJson.version,
  description: "Instant translation with Chrome built-in Translator API",

  permissions: ["storage", "activeTab"],

  action: {
    default_popup: "src/popup/index.html",
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

});
