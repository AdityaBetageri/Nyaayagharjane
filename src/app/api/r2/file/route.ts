import { NextRequest, NextResponse } from "next/server";
import { r2GetObjectResponse } from "@/lib/r2Server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { error: "ಫೈಲ್ ಕೀ ಅಗತ್ಯವಿದೆ (Key parameter is required)." },
      { status: 400 }
    );
  }

  try {
    const rangeHeader = req.headers.get("range");
    const r2Res = await r2GetObjectResponse(key, rangeHeader);

    if (!r2Res.ok) {
      return NextResponse.json(
        {
          error: `R2 ನಿಂದ ಫೈಲ್ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ (HTTP ${r2Res.status})`,
        },
        { status: r2Res.status }
      );
    }

    const responseHeaders = new Headers();

    const contentType =
      r2Res.headers.get("content-type") ||
      (key.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream");
    responseHeaders.set("Content-Type", contentType);

    const rawFileName = key.split("/").pop() || "document.pdf";
    // Encode filename for RFC 5987 compliance so non-ASCII Kannada characters don't crash HTTP headers
    const safeAsciiName = rawFileName.replace(/[^\x20-\x7E]/g, "_");
    const encodedUtf8Name = encodeURIComponent(rawFileName);
    responseHeaders.set(
      "Content-Disposition",
      `inline; filename="${safeAsciiName}"; filename*=UTF-8''${encodedUtf8Name}`
    );

    const contentLength = r2Res.headers.get("content-length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);

    const contentRange = r2Res.headers.get("content-range");
    if (contentRange) responseHeaders.set("Content-Range", contentRange);

    const acceptRanges = r2Res.headers.get("accept-ranges") || "bytes";
    responseHeaders.set("Accept-Ranges", acceptRanges);

    responseHeaders.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");

    return new Response(r2Res.body, {
      status: r2Res.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "ಸರ್ವರ್ ದೋಷ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
