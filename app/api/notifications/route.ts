import { NextResponse } from "next/server";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_NOTIFICATIONS);
}

export async function PATCH() {
  // Mock mark-all-read — just return success
  return NextResponse.json({ success: true });
}
