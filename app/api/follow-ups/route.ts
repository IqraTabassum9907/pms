import { NextResponse } from "next/server";
import { MOCK_FOLLOW_UPS, MOCK_VENDORS, MOCK_PURCHASE_ORDERS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_FOLLOW_UPS);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `fu-${Date.now()}`;
  const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];
  const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === body.poId) || MOCK_PURCHASE_ORDERS[0];

  return NextResponse.json(
    {
      id,
      entityType: "PO",
      entityId: po.id,
      entityNo: po.poNo,
      vendorId: vendor.id,
      vendor,
      poId: po.id,
      po: { poNo: po.poNo },
      followUpDate: new Date().toISOString(),
      nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate).toISOString() : null,
      daysPending: 2,
      status: body.status || "IN_PROGRESS",
      remarks: body.remarks || "Followed up with vendor regarding expected delivery schedule.",
      actionTaken: body.actionTaken || "CALL",
      createdByName: body.userName || "Amit Patel",
      createdAt: new Date().toISOString(),
    },
    { status: 201 }
  );
}
