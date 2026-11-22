import { r2GetObject, r2PutObject } from "./r2Server";

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

function passKeyPath(uid: string): string {
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeUid) throw new Error("Invalid UID");
  return `${PASSKEY_PREFIX}${safeUid}.json`;
}

export async function getPasskeys(uid: string): Promise<StoredPasskeyCredential[]> {
  try {
    const raw = await r2GetObject(passKeyPath(uid));
    if (!raw) return [];
    const store: PasskeyStore = JSON.parse(raw);
    return store.credentials || [];
  } catch {
    return [];
  }
}

export async function addPasskey(
  uid: string,
  credential: StoredPasskeyCredential
): Promise<StoredPasskeyCredential[]> {
  const existing = await getPasskeys(uid);
  const filtered = existing.filter((c) => c.credentialId !== credential.credentialId);
  filtered.push(credential);

  const store: PasskeyStore = { uid, credentials: filtered };
  await r2PutObject(passKeyPath(uid), JSON.stringify(store), "application/json");
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

  const store: PasskeyStore = { uid, credentials };
  await r2PutObject(passKeyPath(uid), JSON.stringify(store), "application/json");
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

  const store: PasskeyStore = { uid, credentials: filtered };
  await r2PutObject(passKeyPath(uid), JSON.stringify(store), "application/json");
  return filtered;
}
