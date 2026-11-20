import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { r2GetObject, r2PutObject, getR2ServerConfig } from "@/lib/r2Server";

const R2_SETTINGS_KEY = "data/siteSettings.json";
const LOCAL_SETTINGS_PATH = path.join(process.cwd(), "public", "data", "siteSettings.json");

const DEFAULT_SETTINGS = {
  officeAddress: "ನ್ಯಾಯ ಘರ್ಜನೆ ಭವನ, ಮುಖ್ಯ ರಸ್ತೆ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ - ೫೬೦೦೦೧",
  contactEmail: "contact@nyaayagharjane.com",
  contactPhone: "+91 94480 00000",
  editorName: "ನ್ಯಾಯ ಘರ್ಜನೆ ಸಂಪಾದಕರು",
  editorTitle: "ಪ್ರಧಾನ ಸಂಪಾದಕರು (Chief Editor)",
};

export async function GET() {
  // 1. Try reading directly from Cloudflare R2 bucket first
  try {
    const r2Data = await r2GetObject(R2_SETTINGS_KEY);
    if (r2Data && r2Data.trim()) {
      const parsed = JSON.parse(r2Data);
      // Update local file cache in background
      try {
        fs.writeFileSync(LOCAL_SETTINGS_PATH, JSON.stringify(parsed, null, 2), "utf-8");
      } catch {
        // ignore local cache error
      }
      return NextResponse.json(parsed);
    }
  } catch (err) {
    console.warn("Could not read siteSettings from R2, falling back to local:", err);
  }

  // 2. Fallback to local file
  try {
    if (fs.existsSync(LOCAL_SETTINGS_PATH)) {
      const data = fs.readFileSync(LOCAL_SETTINGS_PATH, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }
  } catch (err) {
    console.error("Failed to read local siteSettings.json:", err);
  }

  return NextResponse.json(DEFAULT_SETTINGS);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = {
      officeAddress: body.officeAddress?.trim() || DEFAULT_SETTINGS.officeAddress,
      contactEmail: body.contactEmail?.trim() || DEFAULT_SETTINGS.contactEmail,
      contactPhone: body.contactPhone?.trim() || DEFAULT_SETTINGS.contactPhone,
      editorName: body.editorName?.trim() || DEFAULT_SETTINGS.editorName,
      editorTitle: body.editorTitle?.trim() || DEFAULT_SETTINGS.editorTitle,
      updatedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(updated, null, 2);

    // 1. Save to local disk cache
    try {
      const dir = path.dirname(LOCAL_SETTINGS_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(LOCAL_SETTINGS_PATH, jsonString, "utf-8");
    } catch (err) {
      console.warn("Could not write local siteSettings.json:", err);
    }

    // 2. Store safely in Cloudflare R2 object storage
    let r2Saved = false;
    const r2Config = getR2ServerConfig();
    if (r2Config) {
      try {
        await r2PutObject(R2_SETTINGS_KEY, jsonString, "application/json; charset=utf-8");
        r2Saved = true;
      } catch (r2Err) {
        console.warn("Could not save siteSettings to R2 bucket:", r2Err);
      }
    }

    return NextResponse.json({
      success: true,
      settings: updated,
      savedToR2: r2Saved,
    });
  } catch (err: unknown) {
    console.error("Failed to save siteSettings:", err);
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
