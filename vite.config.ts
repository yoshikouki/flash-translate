import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./src/manifest";
import path from "path";

function contentScriptHmr(): Plugin {
  return {
    name: "content-script-hmr",
    handleHotUpdate({ file, server }) {
      if (file.includes("/content/")) {
        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), crx({ manifest }), contentScriptHmr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
      },
    },
  },
});
