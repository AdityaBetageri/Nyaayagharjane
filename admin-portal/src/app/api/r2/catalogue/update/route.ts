import { NextRequest, NextResponse } from "next/server";
import { getR2ServerConfig, r2GetObject, r2PutObject } from "@/lib/r2Server";
import { R2Catalogue, R2NewspaperItem } from "@/types/r2";
import fs from "fs";
import path from "path";

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
        { success: false, message: "ಅಮಾನ್ಯವಾದ ಕ್ಯಾಟಲಾಗ್ ವಿವರಗಳು (No item or catalogue provided)." },
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
      // 1. Try to fetch existing catalogue from R2
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

      // If R2 had no catalogue yet, check local public/data/newspapers.json
      if (existingList.length === 0) {
        try {
          const localPath = path.join(process.cwd(), "public", "data", "newspapers.json");
          if (fs.existsSync(localPath)) {
            const localContent = fs.readFileSync(localPath, "utf-8");
            const parsed = JSON.parse(localContent);
            if (Array.isArray(parsed.newspapers)) {
              existingList = parsed.newspapers;
            }
          }
        } catch {
          // Ignore local read error
        }
      }

      // Merge: replace existing item with same id, or prepend
      const filtered = existingList.filter((item) => item.id !== newItem.id);
      const mergedList = [newItem, ...filtered];

      updatedCatalogue = {
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        newspapers: mergedList,
      };
    } else {
      return NextResponse.json({ success: false, message: "ಅಮಾನ್ಯವಾದ ವಿನಂತಿ" }, { status: 400 });
    }

    const jsonString = JSON.stringify(updatedCatalogue, null, 2);

    // Write to R2 if configured
    let r2Saved = false;
    let r2Error: string | null = null;
    if (config) {
      try {
        await r2PutObject("data/newspapers.json", jsonString, "application/json");
        r2Saved = true;
      } catch (err: unknown) {
        r2Error = err instanceof Error ? err.message : "R2 ಗೆ ಕ್ಯಾಟಲಾಗ್ ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ";
      }
    }

    // Also update local file in public/data/newspapers.json so fallback/dev is always updated
    try {
      const localDir = path.join(process.cwd(), "public", "data");
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      fs.writeFileSync(path.join(localDir, "newspapers.json"), jsonString, "utf-8");
    } catch {
      // Local write non-fatal
    }

    return NextResponse.json({
      success: true,
      r2Saved,
      r2Error,
      catalogue: updatedCatalogue,
      message: r2Saved
        ? "newspapers.json ಕ್ಯಾಟಲಾಗ್ Cloudflare R2 ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ!"
        : "ಸ್ಥಳೀಯವಾಗಿ ಕ್ಯಾಟಲಾಗ್ ಅಪ್‌ಡೇಟ್ ಆಗಿದೆ (R2 ರುಜುವಾತುಗಳು ಇರದ ಕಾರಣ ಸ್ಥಳೀಯವಾಗಿ ಮಾತ್ರ ಉಳಿಸಲಾಗಿದೆ).",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ಕ್ಯಾಟಲಾಗ್ ಅಪ್‌ಡೇಟ್ ವಿಫಲವಾಗಿದೆ";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
