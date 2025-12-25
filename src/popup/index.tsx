import React from "react";
import ReactDOM from "react-dom/client";
import ErrorBoundary from "@/shared/components/error-boundary";
import { getMessage } from "@/shared/utils/i18n";
import App from "./app";
import "./styles/popup.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center text-red-600">
          {getMessage("popup_error_generic")}
        </div>
      }
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
