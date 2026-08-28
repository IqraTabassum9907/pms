import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, createNotification } from "@/lib/services/audit-notification";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quotationId, indentId, vendorId, userEmail, userName, userRole } = body;

    // Update selected quotation status to SELECTED
    const quotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: "SELECTED" },
      include: { vendor: true, indent: true },
    });

    // Mark other quotations for same indent as REJECTED
    if (indentId) {
      await prisma.quotation.updateMany({
        where: {
          indentId,
          id: { not: quotationId },
        },
        data: { status: "REJECTED" },
      });
    }

    await createAuditLog({
      userEmail: userEmail || "manager@purchaseflow.com",
      userName: userName || "Priya Nair",
      userRole: userRole || "PURCHASE_MANAGER",
      action: "Selected Vendor Quote",
      entity: "Quotation",
      entityId: quotation.quotationNo,
      previousStatus: "RECEIVED",
      newStatus: "SELECTED",
      details: `Selected vendor ${quotation.vendor.name} for quotation ${quotation.quotationNo} on indent ${quotation.indent?.indentNo}`,
    });

    await createNotification({
      title: `Vendor Selected for ${quotation.indent?.indentNo}`,
      message: `${quotation.vendor.name} selected. Ready to create Purchase Order.`,
      type: "SUCCESS",
      recipientRole: "PURCHASE_EXECUTIVE",
      linkUrl: "/purchase/po",
    });

    return NextResponse.json({ success: true, quotation });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process vendor selection" }, { status: 500 });
  }
}
