import crypto from "crypto";
import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

export interface R2ServerConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export interface PartUploadInfo {
  PartNumber: number;
  ETag: string;
}

/**
 * Retrieve R2 server credentials from environment variables.
 * Returns null if essential credentials (account, access key, secret key) are missing.
 */
export function getR2ServerConfig(): R2ServerConfig | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim() || "enewspaper-storage";
  const publicUrl =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ||
    process.env.VITE_R2_PUBLIC_URL?.trim() ||
    "";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
}

/**
 * Check which R2 environment variables are currently configured.
 */
export function getR2ConfigStatus() {
  const accountId = !!process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = !!process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = !!process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = !!process.env.R2_BUCKET_NAME?.trim();
  const publicUrl = !!(
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ||
    process.env.VITE_R2_PUBLIC_URL?.trim()
  );

  const isFullyConfigured = accountId && accessKeyId && secretAccessKey;

  const missing: string[] = [];
  if (!accountId) missing.push("R2_ACCOUNT_ID");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");

  return {
    isFullyConfigured,
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
    missing,
  };
}

// ---------------------------------------------------------------------------
// AWS Signature Version 4 (SigV4) Signer for Cloudflare R2
// ---------------------------------------------------------------------------

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function sha256Hex(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function getSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string = "auto",
  service: string = "s3"
): Buffer {
  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function encodeRfc3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

/**
 * Sign an S3 request for Cloudflare R2 with AWS SigV4.
 */
function signR2Request(params: {
  method: string;
  config: R2ServerConfig;
  key: string; // Object path, e.g. "newspapers/2026/11-november/kannada.pdf"
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  payload?: Buffer | string;
}): { url: string; headers: Record<string, string> } {
  const { method, config, key, queryParams = {}, headers = {}, payload = "" } = params;

  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const region = "auto";
  const service = "s3";

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // e.g. 20261116T120000Z
  const dateStamp = amzDate.substring(0, 8); // 20261116

  // Clean key (prevent leading slash)
  const cleanKey = key.replace(/^\/+/, "");
  // Canonical URI path: /bucket/key (each path segment encoded)
  const canonicalUri =
    "/" +
    [config.bucketName, ...cleanKey.split("/")]
      .map((segment) => encodeRfc3986(segment))
      .join("/");

  // Canonical Query String (sorted by param name)
  const sortedQueryKeys = Object.keys(queryParams).sort();
  const canonicalQueryString = sortedQueryKeys
    .map((k) => `${encodeRfc3986(k)}=${encodeRfc3986(queryParams[k])}`)
    .join("&");

  // Payload hash
  const payloadHash =
    payload instanceof Buffer
      ? sha256Hex(payload)
      : typeof payload === "string" && payload.length > 0
      ? sha256Hex(Buffer.from(payload, "utf-8"))
      : sha256Hex(Buffer.from(""));

  // Headers to sign
  const requestHeaders: Record<string, string> = {
    host,
    "x-amz-date": amzDate,
    "x-amz-content-sha256": payloadHash,
    ...headers,
  };

  // Canonical Headers & Signed Headers
  const lowerHeaderKeys = Object.keys(requestHeaders)
    .map((k) => k.toLowerCase())
    .sort();

  const canonicalHeaders =
    lowerHeaderKeys
      .map((k) => {
        const originalKey = Object.keys(requestHeaders).find(
          (orig) => orig.toLowerCase() === k
        )!;
        return `${k}:${requestHeaders[originalKey].trim()}\n`;
      })
      .join("");

  const signedHeaders = lowerHeaderKeys.join(";");

  // Canonical Request
  const canonicalRequest = [
    method.toUpperCase(),
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  // String to Sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  // Calculate Signature
  const signingKey = getSigningKey(config.secretAccessKey, dateStamp, region, service);
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  // Authorization Header
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const finalHeaders: Record<string, string> = {
    ...requestHeaders,
    Authorization: authorization,
  };

  const queryString = canonicalQueryString ? `?${canonicalQueryString}` : "";
  const fullUrl = `https://${host}${canonicalUri}${queryString}`;

  return {
    url: fullUrl,
    headers: finalHeaders,
  };
}

// ---------------------------------------------------------------------------
// Cloudflare R2 Operations
// ---------------------------------------------------------------------------

/**
 * 1. Initiate Multipart Upload
 * Returns the uploadId assigned by Cloudflare R2.
 */
export async function r2InitiateMultipartUpload(
  key: string,
  contentType: string = "application/pdf"
): Promise<{ uploadId: string; key: string }> {
  const config = getR2ServerConfig();
  if (!config) {
    throw new Error("Cloudflare R2 ರುಜುವಾತುಗಳು ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ (Missing R2 credentials).");
  }

  const { url, headers } = signR2Request({
    method: "POST",
    config,
    key,
    queryParams: { uploads: "" },
    headers: {
      "content-type": contentType,
    },
  });

  const res = await fetch(url, {
    method: "POST",
    headers,
  });

  const text = await res.text();
  if (!res.ok) {
    const errorMatch = text.match(/<Message>(.*?)<\/Message>/);
    throw new Error(
      `R2 Multipart ಆರಂಭ ವಿಫಲವಾಗಿದೆ (${res.status}): ${errorMatch ? errorMatch[1] : text}`
    );
  }

  const uploadIdMatch = text.match(/<UploadId>(.*?)<\/UploadId>/);
  if (!uploadIdMatch || !uploadIdMatch[1]) {
    throw new Error("R2 ನಿಂದ UploadId ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.");
  }

  return {
    uploadId: uploadIdMatch[1],
    key,
  };
}

/**
 * 2. Upload Part (Chunk)
 * Uploads a chunk and returns the ETag.
 */
export async function r2UploadPart(
  uploadId: string,
  key: string,
  partNumber: number,
  chunkBuffer: Buffer
): Promise<{ partNumber: number; etag: string }> {
  const config = getR2ServerConfig();
  if (!config) {
    throw new Error("Cloudflare R2 ರುಜುವಾತುಗಳು ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ.");
  }

  const { url, headers } = signR2Request({
    method: "PUT",
    config,
    key,
    queryParams: {
      partNumber: String(partNumber),
      uploadId,
    },
    payload: chunkBuffer,
  });

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: chunkBuffer as unknown as BodyInit,
  });

  if (!res.ok) {
    const text = await res.text();
    const errorMatch = text.match(/<Message>(.*?)<\/Message>/);
    throw new Error(
      `ಭಾಗ ${partNumber} ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ (${res.status}): ${
        errorMatch ? errorMatch[1] : text
      }`
    );
  }

  const rawEtag = res.headers.get("etag") || "";
  // Strip quotes if present
  const etag = rawEtag.replace(/^"|"$/g, "");

  return {
    partNumber,
    etag: `"${etag}"`,
  };
}

/**
 * 3. Complete Multipart Upload
 * Finalizes all uploaded chunks into a single file in R2.
 */
export async function r2CompleteMultipartUpload(
  uploadId: string,
  key: string,
  parts: PartUploadInfo[]
): Promise<{ success: boolean; location: string }> {
  const config = getR2ServerConfig();
  if (!config) {
    throw new Error("Cloudflare R2 ರುಜುವಾತುಗಳು ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ.");
  }

  // Sort parts by PartNumber ascending
  const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);

  // Build S3 CompleteMultipartUpload XML
  const xmlPayload =
    `<CompleteMultipartUpload>` +
    sortedParts
      .map(
        (p) =>
          `<Part><PartNumber>${p.PartNumber}</PartNumber><ETag>${
            p.ETag.startsWith('"') ? p.ETag : `"${p.ETag}"`
          }</ETag></Part>`
      )
      .join("") +
    `</CompleteMultipartUpload>`;

  const { url, headers } = signR2Request({
    method: "POST",
    config,
    key,
    queryParams: { uploadId },
    payload: xmlPayload,
    headers: {
      "content-type": "application/xml",
    },
  });

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: xmlPayload,
  });

  const text = await res.text();
  if (!res.ok) {
    const errorMatch = text.match(/<Message>(.*?)<\/Message>/);
    throw new Error(
      `ಮಲ್ಟಿಪಾರ್ಟ್ ಪೂರ್ಣಗೊಳಿಸಲು ವಿಫಲವಾಗಿದೆ (${res.status}): ${
        errorMatch ? errorMatch[1] : text
      }`
    );
  }

  const locationMatch = text.match(/<Location>(.*?)<\/Location>/);
  const location = locationMatch ? locationMatch[1] : url.split("?")[0];

  return {
    success: true,
    location,
  };
}

/**
 * 4. Abort Multipart Upload (Cleanup upon cancellation)
 */
export async function r2AbortMultipartUpload(
  uploadId: string,
  key: string
): Promise<boolean> {
  const config = getR2ServerConfig();
  if (!config) return false;

  try {
    const { url, headers } = signR2Request({
      method: "DELETE",
      config,
      key,
      queryParams: { uploadId },
    });

    const res = await fetch(url, { method: "DELETE", headers });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 5. Put Object (Direct single upload, used for JSON catalogue)
 */
export async function r2PutObject(
  key: string,
  content: string | Buffer,
  contentType: string = "application/json"
): Promise<{ success: boolean }> {
  const config = getR2ServerConfig();
  if (!config) {
    throw new Error("Cloudflare R2 ರುಜುವಾತುಗಳು ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ.");
  }

  const payload = typeof content === "string" ? Buffer.from(content, "utf-8") : content;

  const { url, headers } = signR2Request({
    method: "PUT",
    config,
    key,
    payload,
    headers: {
      "content-type": contentType,
      "cache-control": "no-cache, no-store, must-revalidate",
    },
  });

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: payload as unknown as BodyInit,
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    const text = await res.text();
    const errorMatch = text.match(/<Message>(.*?)<\/Message>/);
    throw new Error(
      `R2 ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ (${res.status}): ${errorMatch ? errorMatch[1] : text}`
    );
  }

  return { success: true };
}

/**
 * 6. Get Object as streaming response (Proxied S3 fetch)
 */
export async function r2GetObjectResponse(
  key: string,
  rangeHeader?: string | null
): Promise<Response> {
  const config = getR2ServerConfig();
  if (!config) {
    throw new Error("Cloudflare R2 ರುಜುವಾತುಗಳು ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ (Missing R2 credentials).");
  }

  const cleanKey = key.replace(/^\/+/, "");
  const headersToSign: Record<string, string> = {};
  if (rangeHeader) {
    headersToSign["range"] = rangeHeader;
  }

  const { url, headers } = signR2Request({
    method: "GET",
    config,
    key: cleanKey,
    headers: headersToSign,
  });

  return fetch(url, {
    method: "GET",
    headers,
  });
}

/**
 * 6. Get Object (Fetch current JSON catalogue from R2)
 */
export async function r2GetObject(key: string): Promise<string | null> {
  const config = getR2ServerConfig();
  if (!config) return null;

  try {
    const { url, headers } = signR2Request({
      method: "GET",
      config,
      key,
    });

    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    return await res.text();
  } catch {
    return null;
  }
}

/**
 * 7. Delete Object from Cloudflare R2 bucket
 */
export async function r2DeleteObject(
  key: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  const config = getR2ServerConfig();
  if (!config) {
    return {
      success: false,
      error: "Cloudflare R2 ರುಜುವಾತುಗಳು ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ (Missing R2 credentials).",
    };
  }

  const cleanKey = key.replace(/^\/+/, "");

  try {
    const { url, headers } = signR2Request({
      method: "DELETE",
      config,
      key: cleanKey,
    });

    const res = await fetch(url, {
      method: "DELETE",
      headers,
    });

    // In S3 API, DELETE returns 204 No Content on success (or 200 / 404 if not found)
    if (res.ok || res.status === 204 || res.status === 404) {
      return { success: true, status: res.status };
    }

    const text = await res.text();
    const errorMatch = text.match(/<Message>(.*?)<\/Message>/);
    return {
      success: false,
      status: res.status,
      error: errorMatch ? errorMatch[1] : text || `HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "R2 ಫೈಲ್ ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ",
    };
  }
}
