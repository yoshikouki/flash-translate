/**
 * Pure functions for managing language pair download state.
 * These functions are designed to be testable without mocks.
 */

export interface DownloadState {
  downloadingPairs: Set<string>;
  downloadErrors: Set<string>;
}

export const initialDownloadState: DownloadState = {
  downloadingPairs: new Set(),
  downloadErrors: new Set(),
};

/**
 * Creates a unique key for a language pair
 */
export function createPairKey(
  sourceLanguage: string,
  targetLanguage: string
): string {
  return `${sourceLanguage}-${targetLanguage}`;
}

/**
 * Marks a pair as downloading and clears any previous error
 */
export function startDownloading(
  state: DownloadState,
  pairKey: string
): DownloadState {
  const downloadingPairs = new Set(state.downloadingPairs);
  downloadingPairs.add(pairKey);

  const downloadErrors = new Set(state.downloadErrors);
  downloadErrors.delete(pairKey);

  return { downloadingPairs, downloadErrors };
}

/**
 * Marks a pair as finished downloading, optionally with an error
 */
export function finishDownloading(
  state: DownloadState,
  pairKey: string,
  hasError: boolean
): DownloadState {
  const downloadingPairs = new Set(state.downloadingPairs);
  downloadingPairs.delete(pairKey);

  const downloadErrors = new Set(state.downloadErrors);
  if (hasError) {
    downloadErrors.add(pairKey);
  }

  return { downloadingPairs, downloadErrors };
}

/**
 * Clears an error for a specific pair
 */
export function clearError(
  state: DownloadState,
  pairKey: string
): DownloadState {
  const downloadErrors = new Set(state.downloadErrors);
  downloadErrors.delete(pairKey);
  return { ...state, downloadErrors };
}

export type DownloadStatus =
  | "available"
  | "after-download"
  | "downloading"
  | "error"
  | "unavailable"
  | "unsupported";

/**
 * Gets the display status for a language pair based on download state
 */
export function getDownloadStatus(
  state: DownloadState,
  pairKey: string,
  baseStatus:
    | "available"
    | "after-download"
    | "unavailable"
    | "unsupported"
    | undefined
): DownloadStatus {
  if (state.downloadErrors.has(pairKey)) {
    return "error";
  }
  if (state.downloadingPairs.has(pairKey)) {
    return "downloading";
  }
  return baseStatus ?? "unavailable";
}
