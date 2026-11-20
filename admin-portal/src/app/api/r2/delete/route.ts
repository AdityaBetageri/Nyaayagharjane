import { NextRequest, NextResponse } from "next/server";
import {
  getR2ServerConfig,
  r2DeleteObject,
  r2GetObject,
  r2PutObject,
} from "@/lib/r2Server";
import { extractR2KeyFromEdition } from "@/lib/r2Service";
import { R2Catalogue } from "@/types/r2";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const config = getR2ServerConfig();
    const body = await req.json();
    const {
      id,
      fileName,
      pdfUrl,
      year,
      month,
      deleteFile = true,
    } = body as {
      id: string;
      fileName?: string;
      pdfUrl?: string;
      year?: number;
      month?: number | string;
      deleteFile?: boolean;
    };

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ಅಮಾನ್ಯವಾದ ಐಡಿ (Missing edition ID)." },
        { status: 400 }
      );
    }

    // 1. Resolve R2 key for the PDF file
    const resolvedKey = extractR2KeyFromEdition({ pdfUrl, fileName, year, month });

    let r2FileDeleted = false;
    let r2FileError: string | null = null;

    // 2. Delete the PDF file object from Cloudflare R2 bucket
    if (config && resolvedKey && deleteFile) {
      try {
        const deleteRes = await r2DeleteObject(resolvedKey);
        r2FileDeleted = deleteRes.success;
        if (!deleteRes.success && deleteRes.error) {
          r2FileError = deleteRes.error;
        }
      } catch (err) {
        r2FileError = err instanceof Error ? err.message : "R2 ಫೈಲ್ ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ";
      }
    }

    // 3. Update the R2 Database / Catalogue (data/newspapers.json)
    let r2CatalogueUpdated = false;
    let r2CatalogueError: string | null = null;

    if (config) {
      try {
        const r2CatalogueRaw = await r2GetObject("data/newspapers.json");
        if (r2CatalogueRaw) {
          try {
            const parsed = JSON.parse(r2CatalogueRaw) as R2Catalogue;
            if (Array.isArray(parsed.newspapers)) {
              const originalCount = parsed.newspapers.length;
              const filtered = parsed.newspapers.filter((item) => {
                if (item.id === id) return false;
                if (resolvedKey && item.pdfUrl?.includes(resolvedKey)) return false;
                if (fileName && item.fileName === fileName) return false;
                return true;
              });

              if (filtered.length !== originalCount) {
                const updatedCatalogue: R2Catalogue = {
                  version: parsed.version || "1.0",
                  lastUpdated: new Date().toISOString(),
                  newspapers: filtered,
                };
                await r2PutObject(
                  "data/newspapers.json",
                  JSON.stringify(updatedCatalogue, null, 2),
                  "application/json"
                );
                r2CatalogueUpdated = true;
              }
            }
          } catch (parseErr) {
            r2CatalogueError = parseErr instanceof Error ? parseErr.message : "R2 ಕ್ಯಾಟಲಾಗ್ ಪಾರ್ಸಿಂಗ್ ದೋಷ";
          }
        }
      } catch (err) {
        r2CatalogueError = err instanceof Error ? err.message : "R2 ಕ್ಯಾಟಲಾಗ್ ಅಪ್‌ಡೇಟ್ ದೋಷ";
      }
    }

    // 4. Update the local disk database (public/data/newspapers.json)
    let localCatalogueUpdated = false;
    try {
      const localPath = path.join(process.cwd(), "public", "data", "newspapers.json");
      if (fs.existsSync(localPath)) {
        const localContent = fs.readFileSync(localPath, "utf-8");
        const parsed = JSON.parse(localContent) as R2Catalogue;
        if (Array.isArray(parsed.newspapers)) {
          const originalCount = parsed.newspapers.length;
          const filtered = parsed.newspapers.filter((item) => {
            if (item.id === id) return false;
            if (resolvedKey && item.pdfUrl?.includes(resolvedKey)) return false;
            if (fileName && item.fileName === fileName) return false;
            return true;
          });

          if (filtered.length !== originalCount) {
            const updatedCatalogue: R2Catalogue = {
              version: parsed.version || "1.0",
              lastUpdated: new Date().toISOString(),
              newspapers: filtered,
            };
            fs.writeFileSync(localPath, JSON.stringify(updatedCatalogue, null, 2), "utf-8");
            localCatalogueUpdated = true;
          }
        }
      }
    } catch {
      // Local fallback non-fatal
    }

    return NextResponse.json({
      success: true,
      message: "ಪತ್ರಿಕೆ ಮತ್ತು ಸಂಬಂಧಿತ ಫೈಲ್ ಅನ್ನು ಡೇಟಾಬೇಸ್ ಹಾಗೂ R2 ನಿಂದ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.",
      deletedId: id,
      deletedKey: resolvedKey,
      r2FileDeleted,
      r2CatalogueUpdated,
      localCatalogueUpdated,
      warnings: [r2FileError, r2CatalogueError].filter(Boolean),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ಪತ್ರಿಕೆ ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
