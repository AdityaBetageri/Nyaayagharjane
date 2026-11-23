import { NextRequest, NextResponse } from "next/server";
import { getR2ServerConfig, r2GetObject, r2PutObject } from "@/lib/r2Server";
import { R2Catalogue, R2NewspaperItem } from "@/types/r2";

export async function POST(req: NextRequest) {
  try {
    const config = getR2ServerConfig();
    const body = await req.json();
    const { newItem, fullCatalogue } = body as {
      newItem?: R2NewspaperItem;
      fullCatalogue?: R2Catalogue;
    };

    if (!newItem && !fullCatalogue) {
      return NextResponse.json(
        { success: false, message: "No item or catalogue provided." },
        { status: 400 }
      );
    }

    let updatedCatalogue: R2Catalogue;

    if (fullCatalogue) {
      updatedCatalogue = {
        ...fullCatalogue,
        lastUpdated: new Date().toISOString(),
      };
    } else if (newItem) {
      // 1. Fetch existing catalogue directly from Cloudflare R2
      let existingList: R2NewspaperItem[] = [];
      if (config) {
        const r2Content = await r2GetObject("data/newspapers.json");
        if (r2Content) {
          try {
            const parsed = JSON.parse(r2Content);
            if (Array.isArray(parsed.newspapers)) {
              existingList = parsed.newspapers;
            }
          } catch {
            // Ignore parse error from R2
          }
        }
      }

      // Ensure newItem has valid ISO publishedAt timestamp so it ranks newest
      const currentIso = new Date().toISOString();
      const updatedNewItem: R2NewspaperItem = {
        ...newItem,
        publishedAt: newItem.publishedAt ? (newItem.publishedAt.includes("T") ? newItem.publishedAt : `${newItem.publishedAt}T${currentIso.split("T")[1]}`) : currentIso,
      };

      // Filter out previous version of this item if re-uploaded
      const cleanExisting = existingList.filter(
        (item) => item.id !== updatedNewItem.id && item.fileName !== updatedNewItem.fileName
      );

      // Prepend newest uploaded newspaper at index 0 (topmost)
      const mergedList = [updatedNewItem, ...cleanExisting];

      updatedCatalogue = {
        version: "1.0",
        lastUpdated: currentIso,
        newspapers: mergedList,
      };
    } else {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    const jsonString = JSON.stringify(updatedCatalogue, null, 2);

    // Save directly to Cloudflare R2
    let r2Saved = false;
    let r2Error: string | null = null;
    if (config) {
      try {
        await r2PutObject("data/newspapers.json", jsonString, "application/json");
        r2Saved = true;
      } catch (err: unknown) {
        r2Error = err instanceof Error ? err.message : "Failed to save catalogue to R2";
      }
    }

    return NextResponse.json({
      success: true,
      r2Saved,
      r2Error,
      catalogue: updatedCatalogue,
      message: r2Saved
        ? "Catalogue updated successfully in Cloudflare R2."
        : "Catalogue updated in memory (R2 credentials missing).",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update catalogue";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
