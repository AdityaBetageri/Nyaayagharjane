import { NextResponse } from "next/server";
import { getR2ConfigStatus } from "@/lib/r2Server";

export async function GET() {
  const status = getR2ConfigStatus();
  return NextResponse.json(status);
}
