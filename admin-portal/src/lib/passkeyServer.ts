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
import {
  getPasskeys,
  addPasskey,
  updatePasskeyCounter,
  deletePasskey,
  StoredPasskeyCredential,
} from "./passkeyStorage";

const CHALLENGE_SECRET =
  process.env.CHALLENGE_SECRET ||
  process.env.R2_SECRET_ACCESS_KEY ||
  "nyaayagharjane-passkey-challenge-secret-key-32chars";

export async function createChallengeToken(challenge: string, uid: string): Promise<string> {
  const key = new TextEncoder().encode(CHALLENGE_SECRET);
  return new SignJWT({ challenge, uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}

export async function verifyChallengeToken(
  token: string
): Promise<{ challenge: string; uid: string }> {
  const key = new TextEncoder().encode(CHALLENGE_SECRET);
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
  return {
    challenge: payload.challenge as string,
    uid: payload.uid as string,
  };
}

export function getRpConfig(reqUrl?: string) {
  let hostname = "localhost";
  let origin = "http://localhost:3002";

  if (reqUrl) {
    try {
      const u = new URL(reqUrl);
      hostname = u.hostname;
      origin = u.origin;
    } catch {}
  }

  // RP ID must match hostname or parent domain
  const rpID =
    process.env.WEBAUTHN_RP_ID ||
    (hostname.includes("nyaayagharjane.com") ? "nyaayagharjane.com" : hostname);

  const rpName = process.env.WEBAUTHN_RP_NAME || "Nyaayagharjane Admin";

  return { rpID, rpName, origin };
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
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export {
  getPasskeys,
  addPasskey,
  updatePasskeyCounter,
  deletePasskey,
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  isoBase64URLToUint8Array,
  uint8ArrayToBase64URL,
};
export type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransport,
  WebAuthnCredential,
  StoredPasskeyCredential,
};
