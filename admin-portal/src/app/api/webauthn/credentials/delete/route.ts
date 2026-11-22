import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/serverAuth";
import { getPasskeys, deletePasskey } from "@/lib/passkeyServer";

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

  if (!body.credentialId) {
    return NextResponse.json({ error: "Missing credentialId" }, { status: 400 });
  }

  const existing = await getPasskeys(uid);
  if (existing.length <= 1) {
    return NextResponse.json(
      { error: "Cannot delete the last passkey. At least one device must remain enrolled." },
      { status: 400 }
    );
  }

  try {
    const remaining = await deletePasskey(uid, body.credentialId);
    return NextResponse.json({
      success: true,
      message: "Passkey credential deleted.",
      remaining: remaining.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
