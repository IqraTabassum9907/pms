import { NextResponse } from "next/server";
import { MOCK_STOCK, MOCK_STOCK_MOVEMENTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ stock: MOCK_STOCK, movements: MOCK_STOCK_MOVEMENTS });
}
