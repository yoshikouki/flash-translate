import React from "react";
import ReactDOM from "react-dom/client";
import ErrorBoundary from "@/shared/components/error-boundary";
import { getSettings, isUrlExcluded } from "@/shared/storage/settings";
import { createPrefixedLogger } from "@/shared/utils/logger";
import App from "./app";
import contentStyles from "./styles/content.css?inline";

const log = createPrefixedLogger("content");

const HOST_ID = "flash-translate-root";

// Message listener for popup to get current URL
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_CURRENT_URL") {
    sendResponse({ url: window.location.href });
  }
  return false; // Synchronous response
});

async function initializeContentScript() {
  // Check if already initialized
  if (document.getElementById(HOST_ID)) {
    return;
  }

  // Check if current URL is excluded
  const settings = await getSettings();
  const currentUrl = window.location.origin + window.location.pathname;
  if (isUrlExcluded(currentUrl, settings.exclusionPatterns)) {
    log.log("This page is excluded from translation");
    return;
  }

  // Create Shadow DOM host
  const host = document.createElement("div");
  host.id = HOST_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // Inject styles into Shadow DOM
  const style = document.createElement("style");
  style.textContent = contentStyles;
  shadow.appendChild(style);

  // Create React mount point
  const root = document.createElement("div");
  root.id = "react-root";
  shadow.appendChild(root);

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

initializeContentScript();
