import { NextRequest, NextResponse } from "next/server";
import { getR2ServerConfig, r2UploadPart } from "@/lib/r2Server";

export async function POST(req: NextRequest) {
  try {
    const config = getR2ServerConfig();
    if (!config) {
      return NextResponse.json(
        { success: false, message: "Cloudflare R2 ರುಜುವಾತುಗಳು ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const uploadId = formData.get("uploadId") as string;
    const key = formData.get("key") as string;
    const partNumberStr = formData.get("partNumber") as string;
    const chunkFile = formData.get("chunk") as File | null;

    if (!uploadId || !key || !partNumberStr || !chunkFile) {
      return NextResponse.json(
        {
          success: false,
          message: "ಅಗತ್ಯವಿರುವ ವಿವರಗಳು (uploadId, key, partNumber, chunk) ಕೊರತೆಯಾಗಿವೆ.",
        },
        { status: 400 }
      );
    }

    const partNumber = parseInt(partNumberStr, 10);
    if (isNaN(partNumber) || partNumber < 1 || partNumber > 10000) {
      return NextResponse.json(
        { success: false, message: "ಅಮಾನ್ಯವಾದ ಭಾಗ ಸಂಖ್ಯೆ (Invalid part number)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await chunkFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await r2UploadPart(uploadId, key, partNumber, buffer);

    return NextResponse.json({
      success: true,
      partNumber: result.partNumber,
      etag: result.etag,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ಭಾಗ ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
