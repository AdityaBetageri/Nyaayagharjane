/**
 * Cloudflare R2 Resumable Chunk Uploader for Nyaayagharjane E-Newspaper
 * Supports:
 * - Chunked / Multipart Upload (5MB chunks)
 * - Auto-resume where left off if network fails
 * - Exponential backoff retry per chunk
 * - Cancellation via AbortSignal
 * - Real-time progress tracking
 * - Automatic newspapers.json catalogue update in R2
 */

import { R2NewspaperItem } from "@/types/r2";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB standard S3/R2 part size
const MAX_PART_RETRIES = 3;

export type UploadStage =
  | "idle"
  | "checking_resume"
  | "initializing"
  | "uploading_pdf"
  | "completing_pdf"
  | "updating_catalogue"
  | "completed"
  | "paused"
  | "error";

export interface UploadProgress {
  stage: UploadStage;
  percent: number;
  currentPart: number;
  totalParts: number;
  uploadedBytes: number;
  totalBytes: number;
  statusMessage: string;
  error: string | null;
}

export interface StoredUploadSession {
  uploadId: string;
  key: string;
  fileName: string;
  fileSize: number;
  completedParts: Array<{ PartNumber: number; ETag: string }>;
  totalParts: number;
  timestamp: number;
}

function getSessionStorageKey(file: File, key: string): string {
  return `r2_resume_${file.name}_${file.size}_${key.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

export function getSavedUploadSession(file: File, key: string): StoredUploadSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getSessionStorageKey(file, key));
    if (!raw) return null;
    const session: StoredUploadSession = JSON.parse(raw);
    // Ignore sessions older than 24 hours
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(getSessionStorageKey(file, key));
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearUploadSession(file: File, key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getSessionStorageKey(file, key));
  } catch {
    // Ignore error
  }
}

/**
 * Upload a newspaper PDF using chunked multipart upload, with auto-resume, cancellation, and catalogue update.
 */
export async function uploadNewspaperWithChunks(params: {
  file: File;
  itemRecord: R2NewspaperItem;
  targetKey: string;
  onProgress: (progress: UploadProgress) => void;
  shouldPause?: () => boolean;
  signal?: AbortSignal;
}): Promise<{
  success: boolean;
  pdfUrl: string;
  catalogueUpdated: boolean;
  message: string;
}> {
  const { file, itemRecord, targetKey, onProgress, shouldPause, signal } = params;

  if (signal?.aborted) {
    return {
      success: false,
      pdfUrl: itemRecord.pdfUrl,
      catalogueUpdated: false,
      message: "ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
    };
  }

  const totalBytes = file.size;
  const totalParts = Math.max(1, Math.ceil(totalBytes / CHUNK_SIZE));

  let uploadId = "";
  let key = targetKey;
  let completedParts: Array<{ PartNumber: number; ETag: string }> = [];

  // Check for saved resume session
  onProgress({
    stage: "checking_resume",
    percent: 0,
    currentPart: 0,
    totalParts,
    uploadedBytes: 0,
    totalBytes,
    statusMessage: "ಹಿಂದಿನ ಅಪ್‌ಲೋಡ್ ಸೆಶನ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    error: null,
  });

  const existingSession = getSavedUploadSession(file, targetKey);
  if (existingSession && existingSession.uploadId && existingSession.completedParts.length > 0) {
    uploadId = existingSession.uploadId;
    key = existingSession.key;
    completedParts = existingSession.completedParts;

    const percent = Math.round((completedParts.length / totalParts) * 85);
    const uploadedBytes = Math.min(totalBytes, completedParts.length * CHUNK_SIZE);

    onProgress({
      stage: "uploading_pdf",
      percent,
      currentPart: completedParts.length,
      totalParts,
      uploadedBytes,
      totalBytes,
      statusMessage: `ಹಿಂದಿನ ಸೆಶನ್ ಪತ್ತೆಯಾಗಿದೆ: ಭಾಗ ${completedParts.length}/${totalParts} ಈಗಾಗಲೇ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ. ಅಲ್ಲಿಂದಲೇ ಮುಂದುವರಿಯುತ್ತಿದೆ...`,
      error: null,
    });
  } else {
    // Initialize fresh multipart upload
    onProgress({
      stage: "initializing",
      percent: 2,
      currentPart: 0,
      totalParts,
      uploadedBytes: 0,
      totalBytes,
      statusMessage: "R2 ಮಲ್ಟಿಪಾರ್ಟ್ ಸೆಶನ್ ಆರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
      error: null,
    });

    const initRes = await fetch("/api/r2/upload/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: targetKey,
        fileName: file.name,
        contentType: "application/pdf",
      }),
      signal,
    });

    const initData = await initRes.json();
    if (!initRes.ok || !initData.success) {
      throw new Error(
        initData.message || "R2 ಮಲ್ಟಿಪಾರ್ಟ್ ಅಪ್‌ಲೋಡ್ ಆರಂಭಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
      );
    }

    uploadId = initData.uploadId;
    key = initData.key || targetKey;
  }

  // Upload missing chunks
  for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    // Check if cancellation signal was triggered
    if (signal?.aborted) {
      onProgress({
        stage: "paused",
        percent: Math.round((completedParts.length / totalParts) * 85),
        currentPart: partNumber,
        totalParts,
        uploadedBytes: completedParts.length * CHUNK_SIZE,
        totalBytes,
        statusMessage: "ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ (Cancelled).",
        error: null,
      });
      return {
        success: false,
        pdfUrl: itemRecord.pdfUrl,
        catalogueUpdated: false,
        message: "ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
      };
    }

    if (shouldPause && shouldPause()) {
      onProgress({
        stage: "paused",
        percent: Math.round((completedParts.length / totalParts) * 85),
        currentPart: partNumber,
        totalParts,
        uploadedBytes: completedParts.length * CHUNK_SIZE,
        totalBytes,
        statusMessage: "ಅಪ್‌ಲೋಡ್ ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ (Paused).",
        error: null,
      });
      return {
        success: false,
        pdfUrl: itemRecord.pdfUrl,
        catalogueUpdated: false,
        message: "ಅಪ್‌ಲೋಡ್ ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ.",
      };
    }

    // Skip already uploaded parts
    const existingPart = completedParts.find((p) => p.PartNumber === partNumber);
    if (existingPart) {
      continue;
    }

    const start = (partNumber - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalBytes);
    const chunkBlob = file.slice(start, end);

    let partSuccess = false;
    let lastPartError = "";

    // Retry loop for the chunk
    for (let attempt = 1; attempt <= MAX_PART_RETRIES; attempt++) {
      if (signal?.aborted) {
        return {
          success: false,
          pdfUrl: itemRecord.pdfUrl,
          catalogueUpdated: false,
          message: "ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
        };
      }

      try {
        const percent = Math.round(
          ((completedParts.length + (attempt - 1) * 0.1) / totalParts) * 85
        );
        const uploadedBytes = Math.min(totalBytes, completedParts.length * CHUNK_SIZE);

        onProgress({
          stage: "uploading_pdf",
          percent,
          currentPart: partNumber,
          totalParts,
          uploadedBytes,
          totalBytes,
          statusMessage:
            attempt === 1
              ? `PDF ಭಾಗ ${partNumber} / ${totalParts} ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...`
              : `ಭಾಗ ${partNumber} ಮರುಪ್ರಯತ್ನಿಸಲಾಗುತ್ತಿದೆ (ಪ್ರಯತ್ನ ${attempt}/${MAX_PART_RETRIES})...`,
          error: null,
        });

        const formData = new FormData();
        formData.append("uploadId", uploadId);
        formData.append("key", key);
        formData.append("partNumber", String(partNumber));
        formData.append("chunk", chunkBlob, file.name);

        const partRes = await fetch("/api/r2/upload/part", {
          method: "POST",
          body: formData,
          signal,
        });

        const partData = await partRes.json();
        if (!partRes.ok || !partData.success || !partData.etag) {
          throw new Error(partData.message || `ಭಾಗ ${partNumber} ಅಪ್‌ಲೋಡ್ ದೋಷ.`);
        }

        completedParts.push({
          PartNumber: partNumber,
          ETag: partData.etag,
        });

        // Save progress to localStorage for resumption
        const sessionState: StoredUploadSession = {
          uploadId,
          key,
          fileName: file.name,
          fileSize: file.size,
          completedParts,
          totalParts,
          timestamp: Date.now(),
        };
        try {
          localStorage.setItem(
            getSessionStorageKey(file, targetKey),
            JSON.stringify(sessionState)
          );
        } catch {
          // localStorage full or restricted
        }

        partSuccess = true;
        break; // Successfully uploaded part, break retry loop
      } catch (err: unknown) {
        if (signal?.aborted || (err instanceof Error && err.name === "AbortError")) {
          return {
            success: false,
            pdfUrl: itemRecord.pdfUrl,
            catalogueUpdated: false,
            message: "ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
          };
        }
        lastPartError = err instanceof Error ? err.message : "ಭಾಗ ಅಪ್‌ಲೋಡ್ ದೋಷ";
        if (attempt < MAX_PART_RETRIES) {
          // Wait exponential delay before retry
          await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    if (!partSuccess) {
      if (signal?.aborted) {
        return {
          success: false,
          pdfUrl: itemRecord.pdfUrl,
          catalogueUpdated: false,
          message: "ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
        };
      }
      throw new Error(
        `ಭಾಗ ${partNumber} ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ: ${lastPartError}. ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ (ನಿಂತಿದ್ದಲ್ಲಿಂದಲೇ ಮುಂದುವರಿಯುತ್ತದೆ).`
      );
    }
  }

  // Finalize Multipart Upload
  if (signal?.aborted) {
    return {
      success: false,
      pdfUrl: itemRecord.pdfUrl,
      catalogueUpdated: false,
      message: "ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
    };
  }

  onProgress({
    stage: "completing_pdf",
    percent: 88,
    currentPart: totalParts,
    totalParts,
    uploadedBytes: totalBytes,
    totalBytes,
    statusMessage: "PDF ತುಣುಕುಗಳನ್ನು R2 ನಲ್ಲಿ ಜೋಡಿಸಲಾಗುತ್ತಿದೆ...",
    error: null,
  });

  const completeRes = await fetch("/api/r2/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uploadId,
      key,
      parts: completedParts,
    }),
    signal,
  });

  const completeData = await completeRes.json();
  if (!completeRes.ok || !completeData.success) {
    throw new Error(completeData.message || "PDF ಮಲ್ಟಿಪಾರ್ಟ್ ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.");
  }

  // Clear completed session
  clearUploadSession(file, targetKey);

  // Auto-upload newspapers.json catalogue to R2
  if (signal?.aborted) {
    return {
      success: false,
      pdfUrl: itemRecord.pdfUrl,
      catalogueUpdated: false,
      message: "ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
    };
  }

  onProgress({
    stage: "updating_catalogue",
    percent: 94,
    currentPart: totalParts,
    totalParts,
    uploadedBytes: totalBytes,
    totalBytes,
    statusMessage: "newspapers.json ಕ್ಯಾಟಲಾಗ್ ಅನ್ನು R2 ಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅಪ್‌ಡೇಟ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    error: null,
  });

  const catalogueRes = await fetch("/api/r2/catalogue/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      newItem: itemRecord,
    }),
    signal,
  });

  const catalogueData = await catalogueRes.json();

  // Completed!
  onProgress({
    stage: "completed",
    percent: 100,
    currentPart: totalParts,
    totalParts,
    uploadedBytes: totalBytes,
    totalBytes,
    statusMessage: "ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ! PDF ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ ಪ್ರಕಟಿಸಲಾಗಿದೆ.",
    error: null,
  });

  return {
    success: true,
    pdfUrl: itemRecord.pdfUrl,
    catalogueUpdated: !!catalogueData.success,
    message: catalogueData.message || "ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ!",
  };
}
