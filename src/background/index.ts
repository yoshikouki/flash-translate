// Background Service Worker
console.log("Flash Translate background service worker loaded");

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Flash Translate extension installed");
  }
});

export {};
