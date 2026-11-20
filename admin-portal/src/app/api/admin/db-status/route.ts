import { NextResponse } from "next/server";
import { getR2ServerConfig, r2GetObject } from "@/lib/r2Server";

export async function GET() {
  const start = performance.now();
  const config = getR2ServerConfig();

  const publicUrl =
    config?.publicUrl ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ||
    process.env.VITE_R2_PUBLIC_URL?.trim() ||
    "";

  let s3Ok = false;
  let s3CatalogueFound = false;
  let itemCount = 0;
  let s3Error: string | null = null;

  // 1. Check direct S3 credentials and catalogue file
  if (config) {
    try {
      const s3Raw = await r2GetObject("data/newspapers.json");
      if (s3Raw) {
        s3CatalogueFound = true;
        const parsed = JSON.parse(s3Raw);
        itemCount = Array.isArray(parsed?.newspapers) ? parsed.newspapers.length : 0;
        s3Ok = true;
      } else {
        // Connected to S3 bucket, but catalogue file not created yet
        s3Ok = true;
        s3CatalogueFound = false;
      }
    } catch (err) {
      s3Error = err instanceof Error ? err.message : "S3 connection failed";
    }
  } else {
    s3Error = "Database credentials missing in environment variables";
  }

  // 2. Check public storage endpoint
  let publicOk = false;
  let publicStatus = 0;
  if (publicUrl) {
    try {
      const testUrl = `${publicUrl.replace(/\/+$/, "")}/data/newspapers.json`;
      const res = await fetch(testUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      publicStatus = res.status;
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data?.newspapers) && itemCount === 0) {
          itemCount = data.newspapers.length;
        }
        publicOk = true;
      }
    } catch {
      publicOk = false;
    }
  }

  const durationMs = Math.round(performance.now() - start);
  const isConnected = s3Ok || publicOk;

  return NextResponse.json({
    connected: isConnected,
    provider: "Cloudflare R2 Database",
    bucket: config?.bucketName || "naresh",
    itemCount,
    latencyMs: durationMs,
    s3Ok,
    publicOk,
    s3CatalogueFound,
    publicStatus,
    checkedAt: new Date().toISOString(),
    error: isConnected ? null : (s3Error || "Database connection unreachable"),
  });
}
