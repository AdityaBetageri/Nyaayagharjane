import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/serverAuth";
import {
  addPasskey,
  verifyChallengeToken,
  verifyRegistrationResponse,
  getRpConfig,
  uint8ArrayToBase64URL,
  RegistrationResponseJSON,
  StoredPasskeyCredential,
} from "@/lib/passkeyServer";

export async function POST(req: NextRequest) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => ({}));
  const uid = body.uid || auth.user.uid;
  if (uid !== auth.user.uid) {
    return NextResponse.json({ error: "UID mismatch" }, { status: 403 });
  }

  if (!body.challengeToken || !body.response) {
    return NextResponse.json({ error: "Missing challengeToken or response" }, { status: 400 });
  }

  let expectedChallenge: string;
  try {
    const decoded = await verifyChallengeToken(body.challengeToken);
    if (decoded.uid !== uid) {
      return NextResponse.json({ error: "Challenge token UID mismatch" }, { status: 403 });
    }
    expectedChallenge = decoded.challenge;
  } catch {
    return NextResponse.json({ error: "Invalid or expired challenge token" }, { status: 401 });
  }

  const { rpID, origin } = getRpConfig(req.url);

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response as RegistrationResponseJSON,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: `Registration verification failed: ${msg}` }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Registration verification failed" }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;
  const regResponse = body.response as RegistrationResponseJSON;
  const transports = regResponse.response?.transports || [];

  let deviceName = "Passkey Device";
  if (transports.includes("internal")) {
    deviceName = "This Device (Built-in)";
  } else if (transports.includes("hybrid")) {
    deviceName = "Mobile Device (Cross-device)";
  } else if (transports.includes("usb")) {
    deviceName = "Security Key (USB)";
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

  await addPasskey(uid, storedCred);

  return NextResponse.json({
    success: true,
    credentialId: credential.id,
    deviceName,
    message: "Passkey registered successfully.",
  });
}
