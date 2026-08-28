import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, createNotification } from "@/lib/services/audit-notification";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: true, items: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "PO not found" }, { status: 404 });
    }

    const { action, comments, userName, userRole, userEmail, dispatchMethod, recipientEmail, message } = body;

    let newStatus = existing.status;
    let nextLevel = existing.approvalLevel;
    let actualDate = existing.actualDate;

    if (action === "APPROVE") {
      if (existing.approvalLevel >= 4 || userRole === "ADMIN") {
        newStatus = "APPROVED";
        nextLevel = 4;
        actualDate = new Date();
      } else {
        nextLevel = existing.approvalLevel + 1;
        newStatus = "PENDING_APPROVAL";
      }
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
      actualDate = new Date();
    } else if (action === "DISPATCH") {
      newStatus = "SENT";
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: newStatus,
        approvalLevel: nextLevel,
        actualDate,
        approvals: action === "APPROVE" || action === "REJECT" ? {
          create: {
            level: existing.approvalLevel,
            actionBy: userName || "Priya Nair",
            actionRole: userRole || "PURCHASE_MANAGER",
            action: action === "APPROVE" ? "APPROVED" : "REJECTED",
            comments: comments || null,
          },
        } : undefined,
        dispatches: action === "DISPATCH" ? {
          create: {
            dispatchMethod: dispatchMethod || "EMAIL",
            recipientEmail: recipientEmail || existing.vendor.email,
            recipientContact: existing.vendor.phone,
            message: message || "PO dispatched to vendor via portal.",
            status: "SENT",
          },
        } : undefined,
      },
      include: { vendor: true, approvals: true, dispatches: true },
    });

    await createAuditLog({
      userEmail: userEmail || "manager@purchaseflow.com",
      userName: userName || "Priya Nair",
      userRole: userRole || "PURCHASE_MANAGER",
      action: action === "DISPATCH" ? "Dispatched PO" : `PO ${action}`,
      entity: "PurchaseOrder",
      entityId: existing.poNo,
      previousStatus: existing.status,
      newStatus: newStatus,
      details: comments || message || `PO ${existing.poNo} status updated to ${newStatus}`,
    });

    if (newStatus === "APPROVED") {
      await createNotification({
        title: `PO ${existing.poNo} Fully Approved`,
        message: `PO ${existing.poNo} for ${existing.vendor.name} has received full approval and is ready for dispatch.`,
        type: "SUCCESS",
        recipientRole: "PURCHASE_EXECUTIVE",
        linkUrl: "/purchase/po-dispatch",
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update PO" }, { status: 500 });
  }
}
