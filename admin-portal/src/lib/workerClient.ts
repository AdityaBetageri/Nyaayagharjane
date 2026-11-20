/**
 * Cloudflare Worker Client for Nyaayagharjane E-Newspaper.
 * Facilitates secure presigned uploads and catalogue management via the Cloudflare Worker security gateway.
 */

export interface WorkerPresignedResponse {
  success: boolean;
  message?: string;
  uploadUrl: string;
  objectKey: string;
  publicPdfUrl: string;
  expiresInSeconds: number;
  requiredHeaders?: Record<string, string>;
  error?: string;
}

export interface WorkerCompletePayload {
  objectKey: string;
  title: string;
  year: number;
  month: number | string;
  editionArea: string;
  language: string;
  totalPages: number;
  formattedFileSize?: string;
  status?: "published" | "draft";
  description?: string;
}

export interface WorkerCompleteResponse {
  success: boolean;
  message?: string;
  item?: Record<string, unknown>;
  totalItems?: number;
  error?: string;
}

/**
 * Returns the configured Cloudflare Worker base URL.
 */
export function getWorkerBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_WORKER_URL?.trim() || "";
  }
  return (
    process.env.NEXT_PUBLIC_WORKER_URL?.trim() ||
    ""
  );
}

/**
 * Checks whether the Cloudflare Worker gateway is configured.
 */
export function isWorkerConfigured(): boolean {
  return !!getWorkerBaseUrl();
}

/**
 * 1. Request a temporary presigned PUT URL from the Worker gateway.
 * Protected by Firebase ID Token.
 */
export async function requestPresignedUploadUrl(
  params: {
    filename: string;
    fileSizeBytes: number;
    year: number;
    month: number | string;
    editionArea?: string;
  },
  idToken: string
): Promise<WorkerPresignedResponse> {
  const workerUrl = getWorkerBaseUrl();
  if (!workerUrl) {
    throw new Error("Worker URL is not configured. Please set NEXT_PUBLIC_WORKER_URL.");
  }

  const endpoint = `${workerUrl.replace(/\/+$/, "")}/api/upload/request`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      filename: params.filename,
      fileSizeBytes: params.fileSizeBytes,
      contentType: "application/pdf",
      year: params.year,
      month: params.month,
      editionArea: params.editionArea,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Worker rejected request (${res.status} ${res.statusText})`);
  }

  return data;
}

/**
 * 2. Upload the PDF file directly to Cloudflare R2 using the presigned PUT URL.
 * Tracks upload progress from 0 to 100%.
 */
export function uploadPdfToR2PresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", "application/pdf");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(
          new Error(
            `Direct R2 upload failed with HTTP status ${xhr.status}: ${xhr.statusText || "Forbidden / Check CORS"}`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          "Network or CORS error occurred during direct R2 upload. Verify that your R2 bucket CORS allows PUT and Content-Type from this origin."
        )
      );
    };

    xhr.send(file);
  });
}

/**
 * 3. Notify the Worker gateway that uploading has completed.
 * The Worker verifies object presence in R2 and updates data/newspapers.json.
 */
export async function completeUploadViaWorker(
  payload: WorkerCompletePayload,
  idToken: string
): Promise<WorkerCompleteResponse> {
  const workerUrl = getWorkerBaseUrl();
  if (!workerUrl) {
    throw new Error("Worker URL is not configured. Please set NEXT_PUBLIC_WORKER_URL.");
  }

  const endpoint = `${workerUrl.replace(/\/+$/, "")}/api/upload/complete`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Worker failed to complete upload (${res.status} ${res.statusText})`);
  }

  return data;
}

/**
 * 4. Permanently delete an edition and its PDF from R2 via the Worker.
 */
export async function deleteNewspaperViaWorker(
  editionId: string,
  idToken: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const workerUrl = getWorkerBaseUrl();
  if (!workerUrl) {
    throw new Error("Worker URL is not configured. Please set NEXT_PUBLIC_WORKER_URL.");
  }

  const endpoint = `${workerUrl.replace(/\/+$/, "")}/api/catalogue/${encodeURIComponent(editionId)}`;

  const res = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Worker failed to delete edition (${res.status})`);
  }

  return data;
}
