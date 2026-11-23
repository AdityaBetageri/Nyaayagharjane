/**
 * Cloudflare R2 Uploader for Nyaayagharjane E-Newspaper
 * Supports:
 * - Direct single upload for files <= 15 MB (fast, no chunks)
 * - Resumable Chunked / Multipart Upload (5MB chunks) for files > 15 MB
 * - Auto-resume where left off if network fails
 * - Exponential backoff retry per chunk
 * - Cancellation via AbortSignal
 * - Real-time progress tracking
 * - Automatic newspapers.json catalogue update in R2
 */

import { R2NewspaperItem } from "@/types/r2";

const DIRECT_UPLOAD_THRESHOLD = 15 * 1024 * 1024; // 15 MB
const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB chunks for large files
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
 * Upload a newspaper PDF directly (<= 15MB) or with chunks (> 15MB).
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
      message: "Upload cancelled.",
    };
  }

  const totalBytes = file.size;

  // ───────────────────────────────────────────────────────────────────────────
  // STRATEGY A: Direct Single-File Upload for Files <= 15 MB
  // ───────────────────────────────────────────────────────────────────────────
  if (totalBytes <= DIRECT_UPLOAD_THRESHOLD) {
    onProgress({
      stage: "uploading_pdf",
      percent: 5,
      currentPart: 1,
      totalParts: 1,
      uploadedBytes: 0,
      totalBytes,
      statusMessage: "Uploading PDF directly to R2...",
      error: null,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", targetKey);
    formData.append("contentType", "application/pdf");

    // Upload with real-time XHR progress tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/r2/upload/direct", true);

      if (signal) {
        signal.addEventListener("abort", () => {
          xhr.abort();
          reject(new Error("Upload cancelled."));
        });
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const pct = Math.min(90, Math.round((e.loaded / e.total) * 90));
          onProgress({
            stage: "uploading_pdf",
            percent: pct,
            currentPart: 1,
            totalParts: 1,
            uploadedBytes: e.loaded,
            totalBytes,
            statusMessage: `Uploading PDF... (${Math.round((e.loaded / (1024 * 1024)) * 10) / 10} MB / ${Math.round((totalBytes / (1024 * 1024)) * 10) / 10} MB)`,
            error: null,
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              resolve();
            } else {
              reject(new Error(data.message || "Direct upload rejected by server."));
            }
          } catch {
            reject(new Error("Invalid response from direct upload endpoint."));
          }
        } else {
          reject(new Error(`Direct upload failed with HTTP status ${xhr.status}.`));
        }
      };

      xhr.onerror = () => reject(new Error("Network connection error during direct upload."));
      xhr.ontimeout = () => reject(new Error("Upload request timed out."));

      xhr.send(formData);
    });

    // Update catalogue in R2
    onProgress({
      stage: "updating_catalogue",
      percent: 94,
      currentPart: 1,
      totalParts: 1,
      uploadedBytes: totalBytes,
      totalBytes,
      statusMessage: "Updating catalogue in R2...",
      error: null,
    });

    const catalogueRes = await fetch("/api/r2/catalogue/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newItem: itemRecord }),
      signal,
    });

    const catalogueData = await catalogueRes.json().catch(() => ({}));

    onProgress({
      stage: "completed",
      percent: 100,
      currentPart: 1,
      totalParts: 1,
      uploadedBytes: totalBytes,
      totalBytes,
      statusMessage: "Upload completed successfully! Published to catalogue.",
      error: null,
    });

    return {
      success: true,
      pdfUrl: itemRecord.pdfUrl,
      catalogueUpdated: !!catalogueData.success,
      message: catalogueData.message || "Successfully published!",
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STRATEGY B: Chunked Multipart Upload for Large Files (> 15 MB)
  // ───────────────────────────────────────────────────────────────────────────
  const totalParts = Math.max(1, Math.ceil(totalBytes / CHUNK_SIZE));
  let uploadId = "";
  let key = targetKey;
  let completedParts: Array<{ PartNumber: number; ETag: string }> = [];

  onProgress({
    stage: "checking_resume",
    percent: 0,
    currentPart: 0,
    totalParts,
    uploadedBytes: 0,
    totalBytes,
    statusMessage: "Checking previous upload session...",
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
      statusMessage: `Resuming upload: part ${completedParts.length}/${totalParts} already uploaded. Continuing...`,
      error: null,
    });
  } else {
    onProgress({
      stage: "initializing",
      percent: 2,
      currentPart: 0,
      totalParts,
      uploadedBytes: 0,
      totalBytes,
      statusMessage: "Initializing multipart upload session...",
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
      throw new Error(initData.message || "Failed to initialize multipart upload session.");
    }

    uploadId = initData.uploadId;
    key = initData.key || targetKey;
  }

  // Upload missing chunks
  for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    if (signal?.aborted) {
      onProgress({
        stage: "paused",
        percent: Math.round((completedParts.length / totalParts) * 85),
        currentPart: partNumber,
        totalParts,
        uploadedBytes: completedParts.length * CHUNK_SIZE,
        totalBytes,
        statusMessage: "Upload cancelled.",
        error: null,
      });
      return {
        success: false,
        pdfUrl: itemRecord.pdfUrl,
        catalogueUpdated: false,
        message: "Upload cancelled.",
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
        statusMessage: "Upload paused.",
        error: null,
      });
      return {
        success: false,
        pdfUrl: itemRecord.pdfUrl,
        catalogueUpdated: false,
        message: "Upload paused.",
      };
    }

    const existingPart = completedParts.find((p) => p.PartNumber === partNumber);
    if (existingPart) {
      continue;
    }

    const start = (partNumber - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalBytes);
    const chunkBlob = file.slice(start, end);

    let partSuccess = false;
    let lastPartError = "";

    for (let attempt = 1; attempt <= MAX_PART_RETRIES; attempt++) {
      if (signal?.aborted) {
        return {
          success: false,
          pdfUrl: itemRecord.pdfUrl,
          catalogueUpdated: false,
          message: "Upload cancelled.",
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
              ? `Uploading part ${partNumber} / ${totalParts}...`
              : `Retrying part ${partNumber} (attempt ${attempt}/${MAX_PART_RETRIES})...`,
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
          throw new Error(partData.message || `Part ${partNumber} upload error.`);
        }

        completedParts.push({
          PartNumber: partNumber,
          ETag: partData.etag,
        });

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
          localStorage.setItem(getSessionStorageKey(file, targetKey), JSON.stringify(sessionState));
        } catch {}

        partSuccess = true;
        break;
      } catch (err: unknown) {
        if (signal?.aborted || (err instanceof Error && err.name === "AbortError")) {
          return {
            success: false,
            pdfUrl: itemRecord.pdfUrl,
            catalogueUpdated: false,
            message: "Upload cancelled.",
          };
        }
        lastPartError = err instanceof Error ? err.message : "Chunk upload failed";
        if (attempt < MAX_PART_RETRIES) {
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
          message: "Upload cancelled.",
        };
      }
      throw new Error(`Failed to upload part ${partNumber}: ${lastPartError}. Please try again.`);
    }
  }

  // Finalize Multipart Upload
  if (signal?.aborted) {
    return {
      success: false,
      pdfUrl: itemRecord.pdfUrl,
      catalogueUpdated: false,
      message: "Upload cancelled.",
    };
  }

  onProgress({
    stage: "completing_pdf",
    percent: 88,
    currentPart: totalParts,
    totalParts,
    uploadedBytes: totalBytes,
    totalBytes,
    statusMessage: "Assembling parts in R2...",
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
    throw new Error(completeData.message || "Failed to finalize multipart upload.");
  }

  clearUploadSession(file, targetKey);

  // Update catalogue in R2
  onProgress({
    stage: "updating_catalogue",
    percent: 94,
    currentPart: totalParts,
    totalParts,
    uploadedBytes: totalBytes,
    totalBytes,
    statusMessage: "Updating catalogue in R2...",
    error: null,
  });

  const catalogueRes = await fetch("/api/r2/catalogue/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newItem: itemRecord }),
    signal,
  });

  const catalogueData = await catalogueRes.json();

  onProgress({
    stage: "completed",
    percent: 100,
    currentPart: totalParts,
    totalParts,
    uploadedBytes: totalBytes,
    totalBytes,
    statusMessage: "Upload completed successfully! Published to catalogue.",
    error: null,
  });

  return {
    success: true,
    pdfUrl: itemRecord.pdfUrl,
    catalogueUpdated: !!catalogueData.success,
    message: catalogueData.message || "Successfully published!",
  };
}
