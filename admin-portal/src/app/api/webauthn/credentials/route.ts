import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/serverAuth";
import { getPasskeys } from "@/lib/passkeyServer";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const requestedUid = req.nextUrl.searchParams.get("uid") || auth.user.uid;
  if (requestedUid !== auth.user.uid) {
    return NextResponse.json({ error: "UID mismatch" }, { status: 403 });
  }

  const credentials = await getPasskeys(requestedUid);
  return NextResponse.json({
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
