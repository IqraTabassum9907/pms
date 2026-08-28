import { NextResponse } from "next/server";
import { MOCK_RETURNS, MOCK_VENDORS, MOCK_AUDIT_LOGS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(MOCK_RETURNS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `ret-${Date.now()}`;
    const count = MOCK_RETURNS.length + 1;
    const returnNo = `RET-2026-${String(count).padStart(4, "0")}`;
    const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];

    const newReturn = {
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
    };

    // Save in memory
    MOCK_RETURNS.unshift(newReturn);

    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: body.userEmail || "store@purchaseflow.com",
      userName: body.userName || "Ramesh Gupta",
      userRole: body.userRole || "STORE_MANAGER",
      action: "Created Purchase Return",
      entity: "PurchaseReturn",
      entityId: newReturn.returnNo,
      previousStatus: "NONE",
      newStatus: "APPROVED",
      details: `Returned materials to ${vendor.name}. Reason: ${newReturn.reason}`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newReturn, { status: 201 });
  } catch (error) {
    console.error("Error creating return:", error);
    return NextResponse.json({ error: "Failed to create return" }, { status: 500 });
  }
}
