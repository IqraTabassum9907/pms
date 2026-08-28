import { NextResponse } from "next/server";
import { MOCK_QUOTATIONS, MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quotationId, indentId, userEmail, userName, userRole } = body;

    const quotation = MOCK_QUOTATIONS.find((q) => q.id === quotationId || q.quotationNo === quotationId);
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // Set status to SELECTED
    quotation.status = "SELECTED";

    // Mark other quotations for the same indent as REJECTED
    if (indentId) {
      MOCK_QUOTATIONS.forEach((q) => {
        if (q.indentId === indentId && q.id !== quotationId && q.quotationNo !== quotationId) {
          q.status = "REJECTED";
        }
      });
    }

    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: userEmail || "manager@purchaseflow.com",
      userName: userName || "Kavita Singh",
      userRole: userRole || "PURCHASE_MANAGER",
      action: "Selected Vendor Quote",
      entity: "Quotation",
      entityId: quotation.quotationNo,
      previousStatus: "RECEIVED",
      newStatus: "SELECTED",
      details: `Selected vendor quote ${quotation.quotationNo} from ${quotation.vendor?.name}`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    MOCK_NOTIFICATIONS.unshift({
      id: `n-${Date.now()}`,
      title: `Vendor Selected: ${quotation.vendor?.name}`,
      message: `Quotation ${quotation.quotationNo} has been selected. Ready to create Purchase Order.`,
      type: "SUCCESS",
      recipientRole: "PURCHASE_EXECUTIVE",
      isRead: false,
      linkUrl: "/purchase/po",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, quotation });
  } catch (error) {
    console.error("Error in vendor selection:", error);
    return NextResponse.json({ error: "Failed to process vendor selection" }, { status: 500 });
  }
}
