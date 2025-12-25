import React from "react";
import ReactDOM from "react-dom/client";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import App from "./App";
import "./styles/popup.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center text-red-600">An error occurred</div>
      }
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
