import { NextRequest, NextResponse } from "next/server";
import { getR2ServerConfig, r2InitiateMultipartUpload } from "@/lib/r2Server";
import { getR2MonthFolder } from "@/lib/r2Service";

export async function POST(req: NextRequest) {
  try {
    const config = getR2ServerConfig();
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          code: "R2_CONFIG_MISSING",
          message:
            "Cloudflare R2 ರುಜುವಾತುಗಳು (Credentials) ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ. ದಯವಿಟ್ಟು .env.local ನಲ್ಲಿ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY ಮತ್ತು R2_BUCKET_NAME ಸೇರಿಸಿ.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { fileName, year, month, key: explicitKey, contentType } = body;

    let targetKey = explicitKey;
    if (!targetKey) {
      if (!fileName || !year || !month) {
        return NextResponse.json(
          { success: false, message: "ಅಗತ್ಯವಿರುವ ವಿವರಗಳು (fileName, year, month) ಕೊರತೆಯಾಗಿವೆ." },
          { status: 400 }
        );
      }
      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const monthFolder = getR2MonthFolder(Number(month));
      targetKey = `newspapers/${year}/${monthFolder}/${safeFileName}`;
    }

    // Security check: Must be a PDF file and must not have directory traversal
    if (targetKey.includes("..") || !targetKey.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, message: "ಅಮಾನ್ಯವಾದ ಫೈಲ್ ಮಾರ್ಗ ಅಥವಾ ಫೈಲ್ ಮಾದರಿ (Must be PDF)." },
        { status: 400 }
      );
    }

    const result = await r2InitiateMultipartUpload(
      targetKey,
      contentType || "application/pdf"
    );

    return NextResponse.json({
      success: true,
      uploadId: result.uploadId,
      key: result.key,
      chunkSize: 5 * 1024 * 1024, // 5MB standard chunk size
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "R2 Multipart ಆರಂಭಿಸುವಲ್ಲಿ ದೋಷ";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
