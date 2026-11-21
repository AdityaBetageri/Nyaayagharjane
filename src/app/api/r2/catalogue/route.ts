import { NextResponse } from "next/server";
import { getR2ServerConfig, r2GetObject } from "@/lib/r2Server";
import fs from "fs";
import path from "path";

export async function GET() {
  const config = getR2ServerConfig();
  const allNewspapers: any[] = [];
  const seenIds = new Set<string>();

  // Helper to add unique items
  const addItems = (items: any[]) => {
    for (const item of items) {
      if (!item) continue;
      const key = item.id || `${item.fileName}_${item.year}_${item.month}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        allNewspapers.push(item);
      }
    }
  };

  // 1. Try to fetch from Cloudflare R2
  if (config) {
    try {
      const r2Content = await r2GetObject("data/newspapers.json");
      if (r2Content) {
        const parsed = JSON.parse(r2Content);
        if (parsed && Array.isArray(parsed.newspapers)) {
          addItems(parsed.newspapers);
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Also merge with local public/data/newspapers.json so no papers are missed
  try {
    const localPath = path.join(process.cwd(), "public", "data", "newspapers.json");
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.newspapers)) {
        addItems(parsed.newspapers);
      }
    }
  } catch {
    // Fallback
  }

  return NextResponse.json(
    {
      version: "1.0",
      lastUpdated: new Date().toISOString(),
      newspapers: allNewspapers,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    }
  );
}
