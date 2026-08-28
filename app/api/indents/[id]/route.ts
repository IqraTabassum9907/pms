import { NextResponse } from "next/server";
import { MOCK_INDENTS, MOCK_DASHBOARD, MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const indentIndex = MOCK_INDENTS.findIndex((ind) => ind.id === id || ind.indentNo === id);
    const existing = indentIndex !== -1 ? MOCK_INDENTS[indentIndex] : MOCK_INDENTS[0];
    const { action, comments, userName, userRole, userEmail } = body;

    let newStatus = existing.status;

    if (action === "APPROVE") {
      newStatus = "APPROVED";
      if (MOCK_DASHBOARD.kpis.pendingIndents > 0) MOCK_DASHBOARD.kpis.pendingIndents -= 1;
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
      if (MOCK_DASHBOARD.kpis.pendingIndents > 0) MOCK_DASHBOARD.kpis.pendingIndents -= 1;
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

    // Mutate in-memory array
    if (indentIndex !== -1) {
      MOCK_INDENTS[indentIndex] = updated;
    }

    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: userEmail || "depthead@purchaseflow.com",
      userName: userName || "Rajesh Sharma",
      userRole: userRole || "DEPARTMENT_HEAD",
      action: `Indent ${action}`,
      entity: "PurchaseIndent",
      entityId: existing.indentNo,
      previousStatus: existing.status,
      newStatus,
      details: comments || `Indent ${existing.indentNo} status updated to ${newStatus}`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    if (newStatus === "APPROVED") {
      MOCK_NOTIFICATIONS.unshift({
        id: `n-${Date.now()}`,
        title: `Indent ${existing.indentNo} Approved`,
        message: `Indent ${existing.indentNo} has been approved and ready for vendor quotation request.`,
        type: "SUCCESS",
        recipientRole: "PURCHASE_EXECUTIVE",
        isRead: false,
        linkUrl: "/purchase/quotation",
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update indent:", error);
    return NextResponse.json({ error: "Failed to update indent" }, { status: 500 });
  }
}
