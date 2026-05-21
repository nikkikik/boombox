import { NextResponse } from "next/server";
import { buildFarcasterManifest } from "@/lib/farcasterManifest";

export async function GET() {
  return NextResponse.json(buildFarcasterManifest(), {
    headers: {
      "Cache-Control": "public, max-age=60, must-revalidate",
    },
  });
}
