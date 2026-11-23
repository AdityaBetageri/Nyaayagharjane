import { NextResponse } from "next/server";
import { getR2ServerConfig, r2GetObject } from "@/lib/r2Server";
import fs from "fs";
import path from "path";

export async function GET() {
  const config = getR2ServerConfig();

  // 1. Fetch live catalogue directly from Cloudflare R2 (Single Source of Truth)
  if (config) {
    try {
      const r2Content = await r2GetObject("data/newspapers.json");
      if (r2Content) {
        const parsed = JSON.parse(r2Content);
        if (parsed && Array.isArray(parsed.newspapers)) {
          return NextResponse.json(
            {
              version: parsed.version || "1.0",
              lastUpdated: parsed.lastUpdated || new Date().toISOString(),
              newspapers: parsed.newspapers,
            },
            {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
              },
            }
          );
        }
      }
    } catch (err) {
      console.warn("Could not fetch catalogue from R2:", err);
    }
  }

  // 2. Only if R2 is offline or not configured, fall back to local file
  try {
    const localPath = path.join(process.cwd(), "public", "data", "newspapers.json");
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.newspapers)) {
        return NextResponse.json(parsed, {
          headers: { "Cache-Control": "no-store" },
        });
      }
    }
  } catch {}

  return NextResponse.json(
    { version: "1.0", lastUpdated: new Date().toISOString(), newspapers: [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}
