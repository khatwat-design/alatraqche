import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REQUIRED_FIELDS = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHANNEL_ID",
] as const;

export async function GET() {
  const missing = REQUIRED_FIELDS.filter((field) => !process.env[field]);
  return NextResponse.json({
    ok: missing.length === 0,
    missing,
  });
}
