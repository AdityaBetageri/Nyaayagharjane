import { NextRequest, NextResponse } from "next/server";
import { getR2ServerConfig, r2CompleteMultipartUpload, r2AbortMultipartUpload } from "@/lib/r2Server";

export async function POST(req: NextRequest) {
  try {
    const config = getR2ServerConfig();
    if (!config) {
      return NextResponse.json(
        { success: false, message: "Cloudflare R2 ರುಜುವಾತುಗಳು ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { uploadId, key, parts } = body;

    if (!uploadId || !key || !Array.isArray(parts) || parts.length === 0) {
      return NextResponse.json(
        { success: false, message: "ಅಮಾನ್ಯವಾದ ಮಲ್ಟಿಪಾರ್ಟ್ ಪೂರ್ಣಗೊಳಿಸುವ ವಿನಂತಿ." },
        { status: 400 }
      );
    }

    const result = await r2CompleteMultipartUpload(uploadId, key, parts);

    return NextResponse.json({
      success: true,
      location: result.location,
      key,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ಮಲ್ಟಿಪಾರ್ಟ್ ಪೂರ್ಣಗೊಳಿಸಲು ವಿಫಲವಾಗಿದೆ";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { uploadId, key } = body;
    if (uploadId && key) {
      await r2AbortMultipartUpload(uploadId, key);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
