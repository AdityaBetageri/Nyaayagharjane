/**
 * R2-based CRUD for WebAuthn passkey credentials.
 * Credentials are stored as JSON files at: data/passkeys/{uid}.json
 */

import { Env, PasskeyStore, StoredPasskeyCredential } from "./types";

const PASSKEY_PREFIX = "data/passkeys/";

function passKeyPath(uid: string): string {
  // Prevent path traversal
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeUid) throw new Error("Invalid UID");
  return `${PASSKEY_PREFIX}${safeUid}.json`;
}

/**
 * Retrieve all passkey credentials for an admin UID.
 */
export async function getPasskeys(
  env: Env,
  uid: string
): Promise<StoredPasskeyCredential[]> {
  const key = passKeyPath(uid);
  const object = await env.NEWSPAPERS_BUCKET.get(key);
  if (!object) return [];

  try {
    const store: PasskeyStore = await object.json();
    return store.credentials || [];
  } catch {
    return [];
  }
}

/**
 * Store a new passkey credential for an admin UID.
 */
export async function addPasskey(
  env: Env,
  uid: string,
  credential: StoredPasskeyCredential
): Promise<StoredPasskeyCredential[]> {
  const existing = await getPasskeys(env, uid);

  // Prevent duplicate credential IDs
  const filtered = existing.filter(
    (c) => c.credentialId !== credential.credentialId
  );
  filtered.push(credential);

  const store: PasskeyStore = { uid, credentials: filtered };
  const key = passKeyPath(uid);
  await env.NEWSPAPERS_BUCKET.put(key, JSON.stringify(store), {
    httpMetadata: { contentType: "application/json" },
  });

  return filtered;
}

/**
 * Update the counter and lastUsedAt for a credential after authentication.
 */
export async function updatePasskeyCounter(
  env: Env,
  uid: string,
  credentialId: string,
  newCounter: number
): Promise<void> {
  const credentials = await getPasskeys(env, uid);
  const index = credentials.findIndex((c) => c.credentialId === credentialId);
  if (index === -1) return;

  credentials[index].counter = newCounter;
  credentials[index].lastUsedAt = new Date().toISOString();

  const store: PasskeyStore = { uid, credentials };
  const key = passKeyPath(uid);
  await env.NEWSPAPERS_BUCKET.put(key, JSON.stringify(store), {
    httpMetadata: { contentType: "application/json" },
  });
}

/**
 * Delete a passkey credential.
 */
export async function deletePasskey(
  env: Env,
  uid: string,
  credentialId: string
): Promise<StoredPasskeyCredential[]> {
  const credentials = await getPasskeys(env, uid);
  const filtered = credentials.filter((c) => c.credentialId !== credentialId);

  if (filtered.length === credentials.length) {
    throw new Error("Credential not found.");
  }

  const store: PasskeyStore = { uid, credentials: filtered };
  const key = passKeyPath(uid);
  await env.NEWSPAPERS_BUCKET.put(key, JSON.stringify(store), {
    httpMetadata: { contentType: "application/json" },
  });

  return filtered;
}
