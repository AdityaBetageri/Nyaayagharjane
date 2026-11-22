export interface Env {
  // R2 Bucket Binding
  NEWSPAPERS_BUCKET: R2Bucket;

  // Environment Variables & Secrets
  FIREBASE_PROJECT_ID: string;
  ADMIN_UIDS: string; // Comma-separated list of approved admin Firebase UIDs
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_DOMAIN: string;
  ALLOWED_ORIGINS?: string;

  // WebAuthn secrets
  CHALLENGE_SECRET: string; // HMAC key for signing challenge tokens
  WEBAUTHN_RP_ID: string; // e.g. "localhost" or "admin.nyaayagharjane.com"
  WEBAUTHN_RP_NAME: string; // e.g. "Nyaayagharjane Admin"
  WEBAUTHN_ORIGIN: string; // e.g. "http://localhost:3002" or "https://admin.nyaayagharjane.com"
}

export interface NewspaperItem {
  id: string;
  title: string;
  month: string;
  year: number;
  edition: string;
  language: string;
  publishedAt: string;
  pdfUrl: string;
  pdfFilename: string;
  objectKey: string;
  fileSizeBytes: number;
  formattedFileSize: string;
  totalPages: number;
  status: "published" | "draft";
  description?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadRequestPayload {
  filename: string;
  fileSizeBytes: number;
  contentType: string;
  year: number;
  month: number | string;
  editionArea?: string;
}

export interface UploadCompletePayload {
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

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
}

export interface AuthSuccess {
  success: true;
  user: AuthenticatedUser;
}

export interface AuthFailure {
  success: false;
  statusCode: 401 | 403;
  error: string;
}

export type AuthResult = AuthSuccess | AuthFailure;

// ─── WebAuthn / Passkey types ────────────────────────────────────────────────

export interface StoredPasskeyCredential {
  credentialId: string; // Base64URL encoded
  publicKey: string; // Base64URL encoded COSE public key
  counter: number;
  transports?: string[];
  deviceName: string;
  createdAt: string; // ISO 8601
  lastUsedAt: string; // ISO 8601
}

export interface PasskeyStore {
  uid: string;
  credentials: StoredPasskeyCredential[];
}

export interface WebAuthnRegisterOptionsBody {
  uid: string;
}

export interface WebAuthnRegisterVerifyBody {
  uid: string;
  challengeToken: string;
  response: unknown; // RegistrationResponseJSON from @simplewebauthn/types
}

export interface WebAuthnAuthenticateOptionsBody {
  uid: string;
}

export interface WebAuthnAuthenticateVerifyBody {
  uid: string;
  challengeToken: string;
  response: unknown; // AuthenticationResponseJSON from @simplewebauthn/types
}

export interface WebAuthnDeleteBody {
  uid: string;
  credentialId: string;
}
