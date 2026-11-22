import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/serverAuth";
import {
  getPasskeys,
  updatePasskeyCounter,
  verifyChallengeToken,
  verifyAuthenticationResponse,
  isoBase64URLToUint8Array,
  getRpConfig,
  AuthenticationResponseJSON,
  AuthenticatorTransport,
  WebAuthnCredential,
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

  const authResponse = body.response as AuthenticationResponseJSON;
  const credentialId = authResponse.id;

  const existing = await getPasskeys(uid);
  const cred = existing.find((c) => c.credentialId === credentialId);
  if (!cred) {
    return NextResponse.json({ error: "Credential not found. It may have been revoked." }, { status: 404 });
  }

  const webAuthnCred: WebAuthnCredential = {
    id: cred.credentialId,
    publicKey: isoBase64URLToUint8Array(cred.publicKey),
    counter: cred.counter,
    transports: (cred.transports || []) as AuthenticatorTransport[],
  };

  const { rpID, origin } = getRpConfig(req.url);

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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: `Authentication verification failed: ${msg}` }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Authentication verification failed" }, { status: 400 });
  }

  await updatePasskeyCounter(uid, credentialId, verification.authenticationInfo.newCounter);

  return NextResponse.json({
    success: true,
    message: "Passkey authentication successful.",
    credentialId,
    deviceName: cred.deviceName,
  });
}
