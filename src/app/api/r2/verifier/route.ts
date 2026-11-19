import { NextRequest, NextResponse } from "next/server";
import { getR2ServerConfig, r2GetObject } from "@/lib/r2Server";

export async function POST(req: NextRequest) {
  const start = performance.now();

  try {
    const body = await req.json().catch(() => ({}));
    let rawInputUrl = typeof body?.targetUrl === "string" ? body.targetUrl.trim() : "";

    const config = getR2ServerConfig();
    const defaultPublicUrl =
      config?.publicUrl ||
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ||
      process.env.VITE_R2_PUBLIC_URL?.trim() ||
      "";

    if (!rawInputUrl) {
      rawInputUrl = defaultPublicUrl;
    }

    if (!rawInputUrl) {
      return NextResponse.json({
        ok: false,
        message: "ಪರಿಶೀಲಿಸಲು ಯಾವುದೇ URL ಲಭ್ಯವಿಲ್ಲ (.env.local ನಲ್ಲಿ NEXT_PUBLIC_R2_PUBLIC_URL ಸೇರಿಸಿ).",
        durationMs: 0,
      });
    }

    // Smart URL Parsing & Normalization
    let origin = "";
    let isSpecificPdf = false;
    let specificPdfUrl = "";

    try {
      const parsed = new URL(rawInputUrl.startsWith("http") ? rawInputUrl : `https://${rawInputUrl}`);
      origin = parsed.origin;

      if (parsed.pathname.toLowerCase().endsWith(".pdf")) {
        isSpecificPdf = true;
        specificPdfUrl = parsed.toString();
      }
    } catch {
      origin = rawInputUrl.replace(/\/+$/, "");
    }

    const testCatalogueUrl = `${origin}/data/newspapers.json`;

    // 1. Direct S3 API Check (checks if bucket has data/newspapers.json via credentials)
    let s3Ok = false;
    let s3ItemCount = 0;
    let s3Error: string | null = null;
    let s3CatalogueFound = false;

    if (config) {
      try {
        const s3Raw = await r2GetObject("data/newspapers.json");
        if (s3Raw) {
          s3CatalogueFound = true;
          const parsed = JSON.parse(s3Raw);
          s3ItemCount = Array.isArray(parsed?.newspapers) ? parsed.newspapers.length : 0;
          s3Ok = true;
        } else {
          s3Error = "R2 ಬಕೆಟ್‌ನಲ್ಲಿ 'data/newspapers.json' ಇನ್ನೂ ಅಪ್‌ಲೋಡ್ ಆಗಿಲ್ಲ.";
        }
      } catch (err) {
        s3Error = err instanceof Error ? err.message : "S3 API ದೋಷ";
      }
    } else {
      s3Error = "R2 S3 API ರುಜುವಾತುಗಳು (.env.local ನಲ್ಲಿ) ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ.";
    }

    // 2. Server-side Public HTTP Fetch to test public accessibility without browser CORS
    let publicOk = false;
    let publicStatus = 0;
    let publicItemCount = 0;
    let publicError: string | null = null;
    const fetchStart = performance.now();

    try {
      const res = await fetch(testCatalogueUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Nyaayagharjane-Verifier/1.0",
          Accept: "application/json",
        },
        cache: "no-store",
      });

      publicStatus = res.status;
      if (res.ok) {
        const data = await res.json().catch(() => null);
        publicItemCount = Array.isArray(data?.newspapers) ? data.newspapers.length : 0;
        publicOk = true;
      } else {
        publicError = `HTTP ${res.status}: ${res.statusText || "ಕಂಡುಬಂದಿಲ್ಲ (Not Found)"}`;
      }
    } catch (err) {
      publicError = err instanceof Error ? err.message : "ಸಾರ್ವಜನಿಕ ಡೊಮೈನ್‌ಗೆ ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗಿಲ್ಲ";
    }

    const fetchDurationMs = Math.round(performance.now() - fetchStart);

    // 3. Optional: Specific PDF File Check if the user pasted a PDF link
    let pdfCheck: { ok: boolean; status: number; url: string; error?: string } | null = null;
    if (isSpecificPdf && specificPdfUrl) {
      try {
        const pdfRes = await fetch(specificPdfUrl, {
          method: "HEAD",
          headers: { "User-Agent": "Nyaayagharjane-Verifier/1.0" },
          cache: "no-store",
        });
        pdfCheck = {
          ok: pdfRes.ok,
          status: pdfRes.status,
          url: specificPdfUrl,
          error: pdfRes.ok ? undefined : `HTTP ${pdfRes.status}`,
        };
      } catch (err) {
        pdfCheck = {
          ok: false,
          status: 0,
          url: specificPdfUrl,
          error: err instanceof Error ? err.message : "PDF ಫೈಲ್ ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ",
        };
      }
    }

    const totalDurationMs = Math.round(performance.now() - start);

    return NextResponse.json({
      ok: publicOk || s3Ok,
      normalizedBaseUrl: origin,
      testedCatalogueUrl: testCatalogueUrl,
      publicStatus: {
        ok: publicOk,
        status: publicStatus,
        url: testCatalogueUrl,
        itemCount: publicItemCount,
        durationMs: fetchDurationMs,
        error: publicError,
      },
      s3Status: {
        configured: !!config,
        bucketName: config?.bucketName || "naresh",
        catalogueFound: s3CatalogueFound,
        itemCount: s3ItemCount,
        ok: s3Ok,
        error: s3Error,
      },
      pdfCheck,
      durationMs: totalDurationMs,
    });
  } catch (err) {
    const totalDurationMs = Math.round(performance.now() - start);
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ",
        durationMs: totalDurationMs,
      },
      { status: 500 }
    );
  }
}
