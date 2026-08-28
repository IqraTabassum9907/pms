import { NextResponse } from "next/server";
import { MOCK_AUDIT_LOGS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_AUDIT_LOGS);
}
