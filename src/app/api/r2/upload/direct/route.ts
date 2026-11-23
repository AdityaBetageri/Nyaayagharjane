import { NextRequest, NextResponse } from "next/server";
import { getR2ServerConfig, r2PutObject } from "@/lib/r2Server";

// Allow up to 30MB payload in Next.js route handler
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const config = getR2ServerConfig();
    if (!config) {
      return NextResponse.json(
        { success: false, message: "Cloudflare R2 credentials are not configured." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const key = (formData.get("key") as string | null) || "";
    const contentType = (formData.get("contentType") as string | null) || "application/pdf";

    if (!file || !key) {
      return NextResponse.json(
        { success: false, message: "Missing file or target object key." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await r2PutObject(key, buffer, contentType);

    const publicUrl = config.publicUrl
      ? `${config.publicUrl.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`
      : `/api/r2/file?key=${encodeURIComponent(key)}`;

    return NextResponse.json({
      success: true,
      key,
      publicUrl,
      size: file.size,
      message: "File uploaded directly to R2 successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Direct R2 upload failed";
    console.error("Direct R2 upload error:", err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
