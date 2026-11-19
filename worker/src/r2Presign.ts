import { Env } from "./types";

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export interface PresignedUrlResult {
  uploadUrl: string;
  objectKey: string;
  publicPdfUrl: string;
  expiresInSeconds: number;
}

/**
 * Validates file and path parameters to prevent directory traversal or arbitrary writes.
 */
export function sanitizeUploadPath(
  filename: string,
  year: number,
  month: number | string
): { objectKey: string; sanitizedFilename: string; monthSlug: string } {
  // Validate Year
  const numYear = Number(year);
  if (isNaN(numYear) || numYear < 2000 || numYear > 2100) {
    throw new Error("Invalid year. Must be between 2000 and 2100.");
  }

  // Validate Month
  const numMonth = Number(month);
  if (isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
    throw new Error("Invalid month. Must be between 1 and 12.");
  }

  const paddedMonth = String(numMonth).padStart(2, "0");
  const monthName = MONTH_NAMES[numMonth - 1];
  const monthSlug = `${paddedMonth}-${monthName}`;

  // Sanitize Filename (strip directory paths, disallow .., enforce .pdf)
  const baseName = filename.replace(/^.*[\\/]/, "").trim();
  if (!baseName.toLowerCase().endsWith(".pdf")) {
    throw new Error("Invalid file extension. Only .pdf files are allowed.");
  }

  // Strip unsafe characters, keep alphanumeric, dash, underscore, dot
  const cleanName = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!cleanName || cleanName === ".pdf" || cleanName.includes("..")) {
    throw new Error("Invalid or unsafe filename.");
  }

  const objectKey = `newspapers/${numYear}/${monthSlug}/${cleanName}`;
  return { objectKey, sanitizedFilename: cleanName, monthSlug };
}

// Web Crypto Helper Functions for AWS SigV4
async function sha256Hex(data: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(data));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const rawKey = key instanceof Uint8Array ? key : new Uint8Array(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate an AWS SigV4 presigned PUT URL for Cloudflare R2.
 * Restricted strictly to:
 * - Method: PUT
 * - Specific key: objectKey
 * - Enforced Content-Type: application/pdf
 * - Lifetime: 900 seconds (15 minutes)
 */
export async function generateR2PresignedPutUrl(
  env: Env,
  objectKey: string,
  expiresInSeconds: number = 900
): Promise<PresignedUrlResult> {
  const accountId = env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = env.R2_BUCKET_NAME?.trim() || "enewspaper-storage";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 server credentials (Account ID, Access Key, or Secret) are missing in Worker configuration.");
  }

  const region = "auto";
  const service = "s3";
  const host = `${accountId}.r2.cloudflarestorage.com`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  // Strict signed headers: content-type and host
  const signedHeaders = "content-type;host";
  const contentType = "application/pdf";

  // URL-encode path segments according to AWS S3 specs
  const encodedPath = `/${bucketName}/` + objectKey.split("/").map((seg) => encodeURIComponent(seg)).join("/");

  // Query parameters in alphabetical order
  const queryParams: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresInSeconds),
    "X-Amz-SignedHeaders": signedHeaders,
  };

  const canonicalQueryString = Object.keys(queryParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join("&");

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "PUT",
    encodedPath,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const canonicalRequestHash = await sha256Hex(canonicalRequest);

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join("\n");

  // Derive signing key
  const enc = new TextEncoder();
  const kSecret = enc.encode("AWS4" + secretAccessKey);
  const kDate = await hmacSha256(kSecret, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");

  // Calculate signature
  const signatureBuffer = await hmacSha256(kSigning, stringToSign);
  const signature = toHex(signatureBuffer);

  const uploadUrl = `https://${host}${encodedPath}?${canonicalQueryString}&X-Amz-Signature=${signature}`;

  // Build public PDF URL
  const publicBase = (env.R2_PUBLIC_DOMAIN || "").trim().replace(/\/+$/, "");
  const publicPdfUrl = publicBase ? `${publicBase}/${objectKey}` : `https://${host}${encodedPath}`;

  return {
    uploadUrl,
    objectKey,
    publicPdfUrl,
    expiresInSeconds,
  };
}
