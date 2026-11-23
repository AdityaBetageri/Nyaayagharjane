import { r2GetObject, r2PutObject } from "./r2Server";
import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

export interface StoredPasskeyCredential {
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  deviceName: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface PasskeyStore {
  uid: string;
  credentials: StoredPasskeyCredential[];
}

const PASSKEY_PREFIX = "data/passkeys/";

// In-memory cache to guarantee fast responses and prevent blocking on transient R2 timeouts
const memoryPasskeyStore = new Map<string, StoredPasskeyCredential[]>();

function passKeyPath(uid: string): string {
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeUid) throw new Error("Invalid UID");
  return `${PASSKEY_PREFIX}${safeUid}.json`;
}

export async function getPasskeys(uid: string): Promise<StoredPasskeyCredential[]> {
  // If present in memory cache, return immediately for instant response
  if (memoryPasskeyStore.has(uid) && (memoryPasskeyStore.get(uid)?.length ?? 0) > 0) {
    return memoryPasskeyStore.get(uid)!;
  }

  try {
    const raw = await r2GetObject(passKeyPath(uid));
    if (!raw) return memoryPasskeyStore.get(uid) || [];
    const store: PasskeyStore = JSON.parse(raw);
    const creds = store.credentials || [];
    memoryPasskeyStore.set(uid, creds);
    return creds;
  } catch (err) {
    console.warn("Failed to fetch passkeys from R2, using memory store:", err);
    return memoryPasskeyStore.get(uid) || [];
  }
}

export async function addPasskey(
  uid: string,
  credential: StoredPasskeyCredential
): Promise<StoredPasskeyCredential[]> {
  const existing = await getPasskeys(uid);
  const filtered = existing.filter((c) => c.credentialId !== credential.credentialId);
  filtered.push(credential);

  // Update memory store immediately so verification succeeds without waiting
  memoryPasskeyStore.set(uid, filtered);

  // Persist to Cloudflare R2
  try {
    const store: PasskeyStore = { uid, credentials: filtered };
    await r2PutObject(passKeyPath(uid), JSON.stringify(store), "application/json");
  } catch (err) {
    console.warn("R2 persist warning for passkey (persisted in memory):", err);
  }

  return filtered;
}

export async function updatePasskeyCounter(
  uid: string,
  credentialId: string,
  newCounter: number
): Promise<void> {
  const credentials = await getPasskeys(uid);
  const index = credentials.findIndex((c) => c.credentialId === credentialId);
  if (index === -1) return;

  credentials[index].counter = newCounter;
  credentials[index].lastUsedAt = new Date().toISOString();

  memoryPasskeyStore.set(uid, credentials);

  try {
    const store: PasskeyStore = { uid, credentials };
    await r2PutObject(passKeyPath(uid), JSON.stringify(store), "application/json");
  } catch (err) {
    console.warn("R2 counter update warning:", err);
  }
}

export async function deletePasskey(
  uid: string,
  credentialId: string
): Promise<StoredPasskeyCredential[]> {
  const credentials = await getPasskeys(uid);
  const filtered = credentials.filter((c) => c.credentialId !== credentialId);
  if (filtered.length === credentials.length) {
    throw new Error("Credential not found.");
  }

  memoryPasskeyStore.set(uid, filtered);

  try {
    const store: PasskeyStore = { uid, credentials: filtered };
    await r2PutObject(passKeyPath(uid), JSON.stringify(store), "application/json");
  } catch (err) {
    console.warn("R2 delete passkey warning:", err);
  }

  return filtered;
}
