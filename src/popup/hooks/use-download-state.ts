import { useState } from "react";
import type { LanguagePairStatus } from "@/shared/utils/translator";
import {
  clearError,
  createPairKey,
  type DownloadState,
  type DownloadStatus,
  finishDownloading,
  getDownloadStatus,
  initialDownloadState,
  startDownloading,
} from "./download-state";

export interface UseDownloadStateReturn {
  getStatus: (
    sourceLanguage: string,
    targetLanguage: string,
    pairs: LanguagePairStatus[]
  ) => DownloadStatus;
  startDownload: (sourceLanguage: string, targetLanguage: string) => void;
  finishDownload: (
    sourceLanguage: string,
    targetLanguage: string,
    hasError: boolean
  ) => void;
  clearDownloadError: (sourceLanguage: string, targetLanguage: string) => void;
}

export function useDownloadState(): UseDownloadStateReturn {
  const [state, setState] = useState<DownloadState>(initialDownloadState);

  const getStatus = (
    sourceLanguage: string,
    targetLanguage: string,
    pairs: LanguagePairStatus[]
  ): DownloadStatus => {
    const pairKey = createPairKey(sourceLanguage, targetLanguage);
    const baseStatus = pairs.find(
      (p) => p.sourceLanguage === sourceLanguage
    )?.status;
    return getDownloadStatus(state, pairKey, baseStatus);
  };

  const startDownload = (sourceLanguage: string, targetLanguage: string) => {
    const pairKey = createPairKey(sourceLanguage, targetLanguage);
    setState((prev) => startDownloading(prev, pairKey));
  };

  const finishDownload = (
    sourceLanguage: string,
    targetLanguage: string,
    hasError: boolean
  ) => {
    const pairKey = createPairKey(sourceLanguage, targetLanguage);
    setState((prev) => finishDownloading(prev, pairKey, hasError));
  };

  const clearDownloadError = (
    sourceLanguage: string,
    targetLanguage: string
  ) => {
    const pairKey = createPairKey(sourceLanguage, targetLanguage);
    setState((prev) => clearError(prev, pairKey));
  };

  return {
    getStatus,
    startDownload,
    finishDownload,
    clearDownloadError,
  };
}
