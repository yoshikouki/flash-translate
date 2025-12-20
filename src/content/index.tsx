import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import contentStyles from "./styles/content.css?inline";
import { getSettings, isUrlExcluded } from "@/shared/storage/settings";

const HOST_ID = "flash-translate-root";

async function initializeContentScript() {
  // Check if already initialized
  if (document.getElementById(HOST_ID)) {
    return;
  }

  // Check if current URL is excluded
  const settings = await getSettings();
  const currentUrl = window.location.origin + window.location.pathname;
  if (isUrlExcluded(currentUrl, settings.exclusionPatterns)) {
    console.log("[Flash Translate] This page is excluded from translation");
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
