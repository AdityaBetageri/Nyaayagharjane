import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/serverAuth";
import {
  getPasskeys,
  generateAuthenticationOptions,
  createChallengeToken,
  getRpConfig,
  AuthenticatorTransport,
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

  const existing = await getPasskeys(uid);
  if (existing.length === 0) {
    return NextResponse.json({
      success: true,
      hasPasskeys: false,
      credentials: [],
      message: "No passkeys enrolled.",
    });
  }

  const { rpID } = getRpConfig(req.url);

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: existing.map((c) => ({
      id: c.credentialId,
      transports: (c.transports || []) as AuthenticatorTransport[],
    })),
    userVerification: "required",
  });

  const challengeToken = await createChallengeToken(options.challenge, uid);

  return NextResponse.json({
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
