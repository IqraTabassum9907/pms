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

    const existing = await prisma.purchaseIndent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Indent not found" }, { status: 404 });
    }

    const { action, comments, userName, userRole, userEmail } = body;

    let newStatus = existing.status;
    let actualDate = existing.actualDate;

    if (action === "APPROVE") {
      newStatus = "APPROVED";
      actualDate = new Date();
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
      actualDate = new Date();
    } else if (action === "SEND_BACK") {
      newStatus = "DRAFT";
    }

    const updated = await prisma.purchaseIndent.update({
      where: { id },
      data: {
        status: newStatus,
        actualDate,
        approvals: {
          create: {
            actionBy: userName || "Rajesh Sharma",
            actionRole: userRole || "DEPARTMENT_HEAD",
            action: action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "SENT_BACK",
            comments: comments || null,
          },
        },
      },
      include: { department: true, approvals: true, items: true },
    });

    await createAuditLog({
      userEmail: userEmail || "depthead@purchaseflow.com",
      userName: userName || "Rajesh Sharma",
      userRole: userRole || "DEPARTMENT_HEAD",
      action: `Indent ${action}`,
      entity: "PurchaseIndent",
      entityId: existing.indentNo,
      previousStatus: existing.status,
      newStatus: newStatus,
      details: comments || `Indent ${existing.indentNo} status updated to ${newStatus}`,
    });

    if (newStatus === "APPROVED") {
      await createNotification({
        title: `Indent ${existing.indentNo} Approved`,
        message: `Indent ${existing.indentNo} has been approved and ready for vendor quotation request.`,
        type: "SUCCESS",
        recipientRole: "PURCHASE_EXECUTIVE",
        linkUrl: "/purchase/quotation",
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update indent status" }, { status: 500 });
  }
}
