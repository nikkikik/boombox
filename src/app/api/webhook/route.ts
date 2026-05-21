import { NextResponse } from "next/server";

/** Farcaster Mini App event webhook (notifications / analytics). */
export async function POST(request: Request) {
  try {
    await request.json();
  } catch {
    /* empty body ok */
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "boombox-farcaster-webhook" });
}
