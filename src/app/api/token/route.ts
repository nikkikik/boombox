import { NextResponse } from "next/server";
import { BOOM_TOKEN_METADATA } from "@/lib/tokenMetadata";

/** Token list style metadata for wallets / indexers */
export async function GET() {
  return NextResponse.json({
    name: "Boombox Token List",
    version: { major: 1, minor: 0, patch: 0 },
    tokens: [BOOM_TOKEN_METADATA],
  });
}
