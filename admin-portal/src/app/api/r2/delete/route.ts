import { NextRequest, NextResponse } from "next/server";
import {
  getR2ServerConfig,
  r2DeleteObject,
  r2GetObject,
  r2PutObject,
} from "@/lib/r2Server";
import { extractR2KeyFromEdition } from "@/lib/r2Service";
import { R2Catalogue } from "@/types/r2";

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

    if (!id && !fileName && !pdfUrl) {
      return NextResponse.json(
        { success: false, message: "Missing edition identification (id, fileName, or pdfUrl required)." },
        { status: 400 }
      );
    }

    let r2FileDeleted = false;
    let r2FileError: string | null = null;
    let r2CatalogueUpdated = false;
    let r2CatalogueError: string | null = null;
    let deletedKey: string | null = null;

    if (!config) {
      return NextResponse.json(
        { success: false, message: "Cloudflare R2 credentials not configured." },
        { status: 500 }
      );
    }

    // 1. Fetch current catalogue from R2
    const r2CatalogueRaw = await r2GetObject("data/newspapers.json");
    if (r2CatalogueRaw) {
      try {
        const parsed = JSON.parse(r2CatalogueRaw) as R2Catalogue;
        if (Array.isArray(parsed.newspapers)) {
          // Identify the item to delete
          const targetItem = parsed.newspapers.find((item) => {
            if (id && item.id === id) return true;
            if (fileName && item.fileName && item.fileName.trim().toLowerCase() === fileName.trim().toLowerCase()) return true;
            if (pdfUrl && item.pdfUrl && item.pdfUrl === pdfUrl) return true;
            return false;
          });

          // Resolve the key to delete from R2 bucket
          deletedKey = targetItem
            ? extractR2KeyFromEdition(targetItem)
            : extractR2KeyFromEdition({ pdfUrl, fileName, year, month });

          // Filter out the deleted item from the catalogue
          const filtered = parsed.newspapers.filter((item) => {
            if (id && item.id === id) return false;
            if (fileName && item.fileName && item.fileName.trim().toLowerCase() === fileName.trim().toLowerCase()) return false;
            if (pdfUrl && item.pdfUrl && item.pdfUrl === pdfUrl) return false;
            if (deletedKey && item.pdfUrl && item.pdfUrl.includes(deletedKey)) return false;
            return true;
          });

          // Save the updated catalogue to R2
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

          // Also keep local fallback JSON cleanly in sync if it exists
          try {
            const fs = await import("fs");
            const path = await import("path");
            const localPath = path.join(process.cwd(), "public", "data", "newspapers.json");
            if (fs.existsSync(localPath)) {
              fs.writeFileSync(localPath, JSON.stringify(updatedCatalogue, null, 2), "utf-8");
            }
          } catch {}
        }
      } catch (parseErr) {
        r2CatalogueError = parseErr instanceof Error ? parseErr.message : "Failed to parse R2 catalogue.";
      }
    }

    // 2. Delete the PDF file object from Cloudflare R2 bucket if requested
    if (deleteFile && deletedKey) {
      try {
        const deleteRes = await r2DeleteObject(deletedKey);
        r2FileDeleted = deleteRes.success;
        if (!deleteRes.success && deleteRes.error) {
          r2FileError = deleteRes.error;
        }
      } catch (err) {
        r2FileError = err instanceof Error ? err.message : "Failed to delete PDF file from R2.";
      }
    }

    return NextResponse.json({
      success: true,
      message: "Edition metadata and PDF file permanently deleted from Cloudflare R2.",
      deletedId: id,
      deletedKey,
      r2FileDeleted,
      r2CatalogueUpdated,
      warnings: [r2FileError, r2CatalogueError].filter(Boolean),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete edition.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
