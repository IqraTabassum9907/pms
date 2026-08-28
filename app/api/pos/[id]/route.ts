import { NextResponse } from "next/server";
import { createAuditLog, createNotification } from "@/lib/services/audit-notification";
import { MOCK_PURCHASE_ORDERS } from "@/lib/mock-data";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const existing = MOCK_PURCHASE_ORDERS.find((po) => po.id === id) || MOCK_PURCHASE_ORDERS[0];
  const { action, comments, userName, userRole, userEmail, dispatchMethod, recipientEmail, message } = body;

  let newStatus = existing.status;
  let nextLevel = existing.approvalLevel;

  if (action === "APPROVE") {
    if (existing.approvalLevel >= 4 || userRole === "ADMIN") {
      newStatus = "APPROVED";
      nextLevel = 4;
    } else {
      nextLevel = existing.approvalLevel + 1;
      newStatus = "PENDING_APPROVAL";
    }
  } else if (action === "REJECT") {
    newStatus = "REJECTED";
  } else if (action === "DISPATCH") {
    newStatus = "SENT";
  }

  const newApproval = {
    id: `poa-${Date.now()}`,
    level: existing.approvalLevel,
    actionBy: userName || "Kavita Singh",
    actionRole: userRole || "PURCHASE_MANAGER",
    action: action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : action,
    approvedByName: userName || "Kavita Singh",
    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
    comments: comments || null,
    approvedAt: new Date().toISOString(),
  };

  const updated = {
    ...existing,
    status: newStatus,
    approvalLevel: nextLevel,
    approvals: action === "APPROVE" || action === "REJECT"
      ? [...(existing.approvals || []), newApproval]
      : existing.approvals,
  };

  await createAuditLog({
    userEmail: userEmail || "manager@purchaseflow.com",
    userName: userName || "Kavita Singh",
    userRole: userRole || "PURCHASE_MANAGER",
    action: action === "DISPATCH" ? "Dispatched PO" : `PO ${action}`,
    entity: "PurchaseOrder",
    entityId: existing.poNo,
    previousStatus: existing.status,
    newStatus,
    details: comments || message || `PO ${existing.poNo} status updated to ${newStatus}`,
  });

  if (newStatus === "APPROVED") {
    await createNotification({
      title: `PO ${existing.poNo} Fully Approved`,
      message: `PO ${existing.poNo} has received full approval and is ready for dispatch.`,
      type: "SUCCESS",
      recipientRole: "PURCHASE_EXECUTIVE",
      linkUrl: "/purchase/po-dispatch",
    });
  }

  return NextResponse.json(updated);
}
