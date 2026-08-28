import { NextResponse } from "next/server";
import { MOCK_RETURNS, MOCK_VENDORS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_RETURNS);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `ret-${Date.now()}`;
  const count = MOCK_RETURNS.length + 1;
  const returnNo = `RET-2026-${String(count).padStart(4, "0")}`;
  const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];

  return NextResponse.json(
    {
      id,
      returnNo,
      grnId: body.grnId || null,
      grn: body.grnId ? { grnNo: body.grnId } : null,
      vendorId: vendor.id,
      vendor,
      returnDate: new Date().toISOString(),
      reason: body.reason || "Damaged/Defective materials rejected during quality inspection.",
      status: "APPROVED",
      totalItems: body.items?.length || 1,
      createdAt: new Date().toISOString(),
      items: body.items || [],
    },
    { status: 201 }
  );
}
