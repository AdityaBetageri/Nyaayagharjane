import { NextResponse } from "next/server";
import { getR2ServerConfig, r2GetObject } from "@/lib/r2Server";
import fs from "fs";
import path from "path";

export async function GET() {
  const config = getR2ServerConfig();

  // 1. Try to fetch from Cloudflare R2
  if (config) {
    try {
      const r2Content = await r2GetObject("data/newspapers.json");
      if (r2Content) {
        const parsed = JSON.parse(r2Content);
        if (parsed && Array.isArray(parsed.newspapers)) {
          return NextResponse.json(parsed, {
            headers: {
              "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            },
          });
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Fallback to local public/data/newspapers.json
  try {
    const localPath = path.join(process.cwd(), "public", "data", "newspapers.json");
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, "utf-8");
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }
  } catch {
    // Fallback
  }

  return NextResponse.json({ version: "1.0", newspapers: [] });
}
