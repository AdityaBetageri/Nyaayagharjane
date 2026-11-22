/**
 * Client-side helper for calling the Worker WebAuthn endpoints.
 */

import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { getFirebaseInstances, getAdminIdToken } from "./firebase";

function getWorkerUrl(): string {
  return process.env.NEXT_PUBLIC_WORKER_URL?.replace(/\/+$/, "") || "";
}

export async function getEffectiveIdToken(): Promise<string | null> {
  // 1. Try Firebase Auth currentUser directly
  try {
    const token = await getAdminIdToken();
    if (token) return token;
  } catch {}

  // 2. Fallback to sessionStorage
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("admin_firebase_id_token");
  }
  return null;
}

export async function getEffectiveUid(): Promise<string | null> {
  const { auth } = getFirebaseInstances();
  if (auth?.currentUser?.uid) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_firebase_uid", auth.currentUser.uid);
    }
    return auth.currentUser.uid;
  }
  if (typeof window !== "undefined") {
    const cachedUid = sessionStorage.getItem("admin_firebase_uid");
    if (cachedUid) return cachedUid;
  }

  // If Firebase Auth is still restoring state, wait a brief moment for it
  if (auth) {
    await new Promise((resolve) => {
      const unsub = auth.onAuthStateChanged((user) => {
        unsub();
        resolve(user?.uid || null);
      });
      setTimeout(resolve, 800);
    });
    if (auth.currentUser?.uid) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_firebase_uid", auth.currentUser.uid);
      }
      return auth.currentUser.uid;
    }
  }

  return null;
}

async function workerFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const workerUrl = getWorkerUrl();
  const token = await getEffectiveIdToken();
  if (!token) throw new Error("Not authenticated. Please login again.");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...((options.headers as Record<string, string>) || {}),
  };

  const endpoint = workerUrl ? `${workerUrl}${path}` : path;
  return fetch(endpoint, { ...options, headers });
}

// ─── Passkey Status ──────────────────────────────────────────────────────────

export interface PasskeyCredentialInfo {
  credentialId: string;
  deviceName: string;
  transports?: string[];
  createdAt: string;
  lastUsedAt: string;
}

/**
 * Check if the admin has any passkeys enrolled.
 */
export async function checkPasskeyStatus(): Promise<{
  hasPasskeys: boolean;
  credentials: PasskeyCredentialInfo[];
}> {
  const uid = await getEffectiveUid();
  if (!uid) throw new Error("No admin UID found.");

  const res = await workerFetch(`/api/webauthn/credentials?uid=${encodeURIComponent(uid)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to check passkey status.");

  return {
    hasPasskeys: (data.credentials || []).length > 0,
    credentials: data.credentials || [],
  };
}

// ─── Registration (Enrollment) ───────────────────────────────────────────────

/**
 * Full passkey registration flow:
 * 1. Get registration options from Worker
 * 2. Call navigator.credentials.create() via @simplewebauthn/browser
 * 3. Send attestation to Worker for verification
 */
export async function registerPasskey(): Promise<{
  credentialId: string;
  deviceName: string;
}> {
  const uid = await getEffectiveUid();
  if (!uid) throw new Error("No admin UID found.");

  // 1. Get registration options
  const optionsRes = await workerFetch("/api/webauthn/register/options", {
    method: "POST",
    body: JSON.stringify({ uid }),
  });
  const optionsData = await optionsRes.json();
  if (!optionsData.success) throw new Error(optionsData.error || "Failed to get registration options.");

  // 2. Start registration (triggers OS/browser biometric prompt)
  let attestation;
  try {
    attestation = await startRegistration({ optionsJSON: optionsData.options });
  } catch (err) {
    if (err instanceof Error && err.name === "NotAllowedError") {
      throw new Error("Registration was cancelled or timed out. Please try again.");
    }
    throw err;
  }

  // 3. Verify registration on the Worker
  const verifyRes = await workerFetch("/api/webauthn/register/verify", {
    method: "POST",
    body: JSON.stringify({
      uid,
      challengeToken: optionsData.challengeToken,
      response: attestation,
    }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) throw new Error(verifyData.error || "Registration verification failed.");

  return {
    credentialId: verifyData.credentialId,
    deviceName: verifyData.deviceName,
  };
}

// ─── Authentication (Verification) ──────────────────────────────────────────

/**
 * Full passkey authentication flow:
 * 1. Get authentication options from Worker
 * 2. Call navigator.credentials.get() via @simplewebauthn/browser
 * 3. Send assertion to Worker for verification
 */
export async function authenticatePasskey(): Promise<{
  credentialId: string;
  deviceName: string;
}> {
  const uid = await getEffectiveUid();
  if (!uid) throw new Error("No admin UID found.");

  // 1. Get authentication options
  const optionsRes = await workerFetch("/api/webauthn/authenticate/options", {
    method: "POST",
    body: JSON.stringify({ uid }),
  });
  const optionsData = await optionsRes.json();
  if (!optionsData.success) throw new Error(optionsData.error || "Failed to get authentication options.");

  if (!optionsData.hasPasskeys) {
    throw new Error("NO_PASSKEYS");
  }

  // 2. Start authentication (triggers OS/browser biometric prompt)
  let assertion;
  try {
    assertion = await startAuthentication({ optionsJSON: optionsData.options });
  } catch (err) {
    if (err instanceof Error && err.name === "NotAllowedError") {
      throw new Error("Authentication was cancelled or timed out. Please try again.");
    }
    throw err;
  }

  // 3. Verify authentication on the Worker
  const verifyRes = await workerFetch("/api/webauthn/authenticate/verify", {
    method: "POST",
    body: JSON.stringify({
      uid,
      challengeToken: optionsData.challengeToken,
      response: assertion,
    }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) throw new Error(verifyData.error || "Authentication verification failed.");

  return {
    credentialId: verifyData.credentialId,
    deviceName: verifyData.deviceName,
  };
}

// ─── Credential Management ──────────────────────────────────────────────────

/**
 * List all enrolled passkey credentials.
 */
export async function listPasskeys(): Promise<PasskeyCredentialInfo[]> {
  const { credentials } = await checkPasskeyStatus();
  return credentials;
}

/**
 * Delete a passkey credential.
 */
export async function deletePasskeyCredential(credentialId: string): Promise<void> {
  const uid = await getEffectiveUid();
  if (!uid) throw new Error("No admin UID found.");

  const res = await workerFetch("/api/webauthn/credentials/delete", {
    method: "POST",
    body: JSON.stringify({ uid, credentialId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to delete credential.");
}
