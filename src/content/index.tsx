import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import contentStyles from "./styles/content.css?inline";

const HOST_ID = "flash-translate-root";

function initializeContentScript() {
  // Check if already initialized
  if (document.getElementById(HOST_ID)) {
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
      <App />
    </React.StrictMode>
  );
}

initializeContentScript();
