import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import "./styles/popup.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div className="p-4 text-center text-red-600">An error occurred</div>}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
