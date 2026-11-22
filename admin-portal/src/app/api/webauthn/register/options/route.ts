import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/serverAuth";
import {
  getPasskeys,
  generateRegistrationOptions,
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

  const { rpID, rpName } = getRpConfig(req.url);
  const existing = await getPasskeys(uid);

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: auth.user.email || uid,
    attestationType: "none",
    excludeCredentials: existing.map((c) => ({
      id: c.credentialId,
      transports: (c.transports || []) as AuthenticatorTransport[],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
    },
  });

  const challengeToken = await createChallengeToken(options.challenge, uid);
  return NextResponse.json({ success: true, options, challengeToken });
}
