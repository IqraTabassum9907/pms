import { NextResponse } from "next/server";
import { MOCK_FOLLOW_UPS, MOCK_VENDORS, MOCK_PURCHASE_ORDERS, MOCK_AUDIT_LOGS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(MOCK_FOLLOW_UPS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `fu-${Date.now()}`;
    const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];
    const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === body.poId || p.poNo === body.poId) || MOCK_PURCHASE_ORDERS[0];

    const newFollowUp = {
      id,
      entityType: "PO",
      entityId: po.id,
      entityNo: po.poNo,
      vendorId: vendor.id,
      vendor,
      poId: po.id,
      po: { poNo: po.poNo },
      subject: body.subject || `Follow-up for ${po.poNo}`,
      message: body.message || body.remarks || "Followed up with vendor",
      followUpDate: new Date().toISOString(),
      nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate).toISOString() : null,
      daysPending: 0,
      status: body.status || "IN_PROGRESS",
      remarks: body.remarks || "Followed up with vendor regarding expected delivery schedule.",
      actionTaken: body.actionTaken || "CALL",
      assignedTo: body.userName || "Amit Patel",
      createdByName: body.userName || "Amit Patel",
      createdAt: new Date().toISOString(),
    };

    // Save in memory
    MOCK_FOLLOW_UPS.unshift(newFollowUp);

    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: body.userEmail || "executive@purchaseflow.com",
      userName: body.userName || "Amit Patel",
      userRole: body.userRole || "PURCHASE_EXECUTIVE",
      action: "Recorded Vendor Follow-Up",
      entity: "FollowUp",
      entityId: po.poNo,
      previousStatus: "PENDING",
      newStatus: newFollowUp.status,
      details: `Action: ${newFollowUp.actionTaken}. ${newFollowUp.remarks}`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newFollowUp, { status: 201 });
  } catch (error) {
    console.error("Error creating follow-up:", error);
    return NextResponse.json({ error: "Failed to record follow-up" }, { status: 500 });
  }
}
