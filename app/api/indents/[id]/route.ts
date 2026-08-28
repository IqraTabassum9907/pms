import { NextResponse } from "next/server";
import { createAuditLog, createNotification } from "@/lib/services/audit-notification";
import { MOCK_INDENTS } from "@/lib/mock-data";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const existing = MOCK_INDENTS.find((ind) => ind.id === id) || MOCK_INDENTS[0];
  const { action, comments, userName, userRole, userEmail } = body;

  let newStatus = existing.status;

  if (action === "APPROVE") {
    newStatus = "APPROVED";
  } else if (action === "REJECT") {
    newStatus = "REJECTED";
  } else if (action === "SEND_BACK") {
    newStatus = "DRAFT";
  }

  const newApproval = {
    id: `ap-${Date.now()}`,
    actionBy: userName || "Rajesh Sharma",
    actionRole: userRole || "DEPARTMENT_HEAD",
    action: action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "SENT_BACK",
    approvedByName: userName || "Rajesh Sharma",
    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
    level: 1,
    comments: comments || null,
    approvedAt: new Date().toISOString(),
  };

  const updated = {
    ...existing,
    status: newStatus,
    approvals: [...(existing.approvals || []), newApproval],
  };

  await createAuditLog({
    userEmail: userEmail || "depthead@purchaseflow.com",
    userName: userName || "Rajesh Sharma",
    userRole: userRole || "DEPARTMENT_HEAD",
    action: `Indent ${action}`,
    entity: "PurchaseIndent",
    entityId: existing.indentNo,
    previousStatus: existing.status,
    newStatus,
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
}
