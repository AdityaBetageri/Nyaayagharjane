/**
 * WebAuthn registration & authentication handlers for the Cloudflare Worker.
 *
 * Uses @simplewebauthn/server for cryptographic operations.
 * Uses jose (already installed) for stateless challenge tokens.
 * Uses R2 (via passkeys.ts) for credential storage.
 */

import { SignJWT, jwtVerify } from "jose";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransport,
  WebAuthnCredential,
} from "@simplewebauthn/server";

import type {
  Env,
  AuthenticatedUser,
  StoredPasskeyCredential,
  WebAuthnRegisterOptionsBody,
  WebAuthnRegisterVerifyBody,
  WebAuthnAuthenticateOptionsBody,
  WebAuthnAuthenticateVerifyBody,
  WebAuthnDeleteBody,
} from "./types";
import {
  getPasskeys,
  addPasskey,
  updatePasskeyCounter,
  deletePasskey,
} from "./passkeys";

// ─── Challenge Token Helpers (stateless using HMAC-signed JWT) ───────────────

async function createChallengeToken(
  challenge: string,
  uid: string,
  env: Env
): Promise<string> {
  const key = new TextEncoder().encode(env.CHALLENGE_SECRET);
  return new SignJWT({ challenge, uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}

async function verifyChallengeToken(
  token: string,
  env: Env
): Promise<{ challenge: string; uid: string }> {
  const key = new TextEncoder().encode(env.CHALLENGE_SECRET);
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
  return {
    challenge: payload.challenge as string,
    uid: payload.uid as string,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRpConfig(env: Env) {
  return {
    rpID: env.WEBAUTHN_RP_ID || "localhost",
    rpName: env.WEBAUTHN_RP_NAME || "Nyaayagharjane Admin",
    origin: env.WEBAUTHN_ORIGIN || "http://localhost:3002",
  };
}

function isoBase64URLToUint8Array(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64URL(arr: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ─── Registration ────────────────────────────────────────────────────────────

/**
 * POST /api/webauthn/register/options
 * Generate registration options (challenge) for creating a new passkey.
 */
export async function handleRegisterOptions(
  body: WebAuthnRegisterOptionsBody,
  user: AuthenticatedUser,
  env: Env
): Promise<Response> {
  const { rpID, rpName } = getRpConfig(env);
  const uid = body.uid || user.uid;

  if (uid !== user.uid) {
    return jsonErr("UID mismatch.", 403);
  }

  const existing = await getPasskeys(env, uid);

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.email || uid,
    attestationType: "none",
    excludeCredentials: existing.map((cred) => ({
      id: cred.credentialId,
      transports: (cred.transports || []) as AuthenticatorTransport[],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
    },
  });

  const challengeToken = await createChallengeToken(
    options.challenge,
    uid,
    env
  );

  return jsonOk({ success: true, options, challengeToken });
}

/**
 * POST /api/webauthn/register/verify
 * Verify a registration response and store the credential in R2.
 */
export async function handleRegisterVerify(
  body: WebAuthnRegisterVerifyBody,
  user: AuthenticatedUser,
  env: Env
): Promise<Response> {
  const { rpID, origin } = getRpConfig(env);
  const uid = body.uid || user.uid;

  if (uid !== user.uid) return jsonErr("UID mismatch.", 403);
  if (!body.challengeToken || !body.response)
    return jsonErr("Missing challengeToken or response.", 400);

  // Verify the challenge token
  let expectedChallenge: string;
  try {
    const decoded = await verifyChallengeToken(body.challengeToken, env);
    if (decoded.uid !== uid) return jsonErr("Challenge token UID mismatch.", 403);
    expectedChallenge = decoded.challenge;
  } catch {
    return jsonErr("Invalid or expired challenge token.", 401);
  }

  // Verify the registration response
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response as RegistrationResponseJSON,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    return jsonErr(`Registration verification failed: ${msg}`, 400);
  }

  if (!verification.verified || !verification.registrationInfo) {
    return jsonErr("Registration verification failed.", 400);
  }

  const { credential } = verification.registrationInfo;

  // Determine device name from the response
  const regResponse = body.response as RegistrationResponseJSON;
  const transports = regResponse.response?.transports || [];

  let deviceName = "Passkey Device";
  if (transports.includes("internal")) {
    deviceName = "This Device (Built-in)";
  } else if (transports.includes("hybrid")) {
    deviceName = "Mobile Device (Cross-device)";
  } else if (transports.includes("usb")) {
    deviceName = "Security Key (USB)";
  } else if (transports.includes("ble")) {
    deviceName = "Security Key (Bluetooth)";
  } else if (transports.includes("nfc")) {
    deviceName = "Security Key (NFC)";
  }

  const now = new Date().toISOString();
  const storedCred: StoredPasskeyCredential = {
    credentialId: credential.id,
    publicKey: uint8ArrayToBase64URL(credential.publicKey),
    counter: credential.counter,
    transports: transports as string[],
    deviceName,
    createdAt: now,
    lastUsedAt: now,
  };

  await addPasskey(env, uid, storedCred);

  return jsonOk({
    success: true,
    credentialId: credential.id,
    deviceName,
    message: "Passkey registered successfully.",
  });
}

// ─── Authentication ──────────────────────────────────────────────────────────

/**
 * POST /api/webauthn/authenticate/options
 * Generate authentication options (challenge) for verifying a passkey.
 */
export async function handleAuthenticateOptions(
  body: WebAuthnAuthenticateOptionsBody,
  user: AuthenticatedUser,
  env: Env
): Promise<Response> {
  const { rpID } = getRpConfig(env);
  const uid = body.uid || user.uid;

  if (uid !== user.uid) return jsonErr("UID mismatch.", 403);

  const existing = await getPasskeys(env, uid);

  if (existing.length === 0) {
    return jsonOk({
      success: true,
      hasPasskeys: false,
      credentials: [],
      message: "No passkeys enrolled. Please register a passkey first.",
    });
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: existing.map((cred) => ({
      id: cred.credentialId,
      transports: (cred.transports || []) as AuthenticatorTransport[],
    })),
    userVerification: "required",
  });

  const challengeToken = await createChallengeToken(
    options.challenge,
    uid,
    env
  );

  return jsonOk({
    success: true,
    hasPasskeys: true,
    options,
    challengeToken,
    credentials: existing.map((c) => ({
      credentialId: c.credentialId,
      deviceName: c.deviceName,
      createdAt: c.createdAt,
      lastUsedAt: c.lastUsedAt,
    })),
  });
}

/**
 * POST /api/webauthn/authenticate/verify
 * Verify an authentication response.
 */
export async function handleAuthenticateVerify(
  body: WebAuthnAuthenticateVerifyBody,
  user: AuthenticatedUser,
  env: Env
): Promise<Response> {
  const { rpID, origin } = getRpConfig(env);
  const uid = body.uid || user.uid;

  if (uid !== user.uid) return jsonErr("UID mismatch.", 403);
  if (!body.challengeToken || !body.response)
    return jsonErr("Missing challengeToken or response.", 400);

  let expectedChallenge: string;
  try {
    const decoded = await verifyChallengeToken(body.challengeToken, env);
    if (decoded.uid !== uid) return jsonErr("Challenge token UID mismatch.", 403);
    expectedChallenge = decoded.challenge;
  } catch {
    return jsonErr("Invalid or expired challenge token.", 401);
  }

  const authResponse = body.response as AuthenticationResponseJSON;
  const credentialId = authResponse.id;

  const existing = await getPasskeys(env, uid);
  const cred = existing.find((c) => c.credentialId === credentialId);

  if (!cred) {
    return jsonErr(
      "Credential not found. This device may have been revoked.",
      404
    );
  }

  const webAuthnCred: WebAuthnCredential = {
    id: cred.credentialId,
    publicKey: isoBase64URLToUint8Array(cred.publicKey),
    counter: cred.counter,
    transports: (cred.transports || []) as AuthenticatorTransport[],
  };

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: webAuthnCred,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    return jsonErr(`Authentication verification failed: ${msg}`, 400);
  }

  if (!verification.verified) {
    return jsonErr("Authentication verification failed.", 400);
  }

  await updatePasskeyCounter(
    env,
    uid,
    credentialId,
    verification.authenticationInfo.newCounter
  );

  return jsonOk({
    success: true,
    message: "Passkey authentication successful.",
    credentialId,
    deviceName: cred.deviceName,
  });
}

// ─── Credential Management ──────────────────────────────────────────────────

/**
 * GET /api/webauthn/credentials?uid=<uid>
 */
export async function handleListCredentials(
  uid: string,
  user: AuthenticatedUser,
  env: Env
): Promise<Response> {
  if (uid !== user.uid) return jsonErr("UID mismatch.", 403);

  const credentials = await getPasskeys(env, uid);
  return jsonOk({
    success: true,
    credentials: credentials.map((c) => ({
      credentialId: c.credentialId,
      deviceName: c.deviceName,
      transports: c.transports,
      createdAt: c.createdAt,
      lastUsedAt: c.lastUsedAt,
    })),
  });
}

/**
 * POST /api/webauthn/credentials/delete
 */
export async function handleDeleteCredential(
  body: WebAuthnDeleteBody,
  user: AuthenticatedUser,
  env: Env
): Promise<Response> {
  const uid = body.uid || user.uid;
  if (uid !== user.uid) return jsonErr("UID mismatch.", 403);
  if (!body.credentialId) return jsonErr("Missing credentialId.", 400);

  const existing = await getPasskeys(env, uid);
  if (existing.length <= 1) {
    return jsonErr(
      "Cannot delete the last passkey. At least one device must remain enrolled.",
      400
    );
  }

  try {
    const remaining = await deletePasskey(env, uid, body.credentialId);
    return jsonOk({
      success: true,
      message: "Passkey credential deleted.",
      remaining: remaining.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return jsonErr(msg, 400);
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function jsonErr(error: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
