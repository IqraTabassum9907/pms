import { NextResponse } from "next/server";
import { createAuditLog, createNotification } from "@/lib/services/audit-notification";
import { MOCK_PURCHASE_ORDERS, MOCK_DASHBOARD, MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const poIndex = MOCK_PURCHASE_ORDERS.findIndex((po) => po.id === id || po.poNo === id);
    const existing = poIndex !== -1 ? MOCK_PURCHASE_ORDERS[poIndex] : MOCK_PURCHASE_ORDERS[0];
    const { action, comments, userName, userRole, userEmail, dispatchMethod, recipientEmail, message } = body;

    let newStatus = existing.status;
    let nextLevel = existing.approvalLevel;

    if (action === "APPROVE") {
      if (existing.approvalLevel >= 4 || userRole === "ADMIN") {
        newStatus = "APPROVED";
        nextLevel = 4;
        if (MOCK_DASHBOARD.kpis.pendingPOs > 0) MOCK_DASHBOARD.kpis.pendingPOs -= 1;
        MOCK_DASHBOARD.kpis.approvedPOs += 1;
      } else {
        nextLevel = existing.approvalLevel + 1;
        newStatus = "PENDING_APPROVAL";
      }
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
      if (MOCK_DASHBOARD.kpis.pendingPOs > 0) MOCK_DASHBOARD.kpis.pendingPOs -= 1;
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

    const newDispatch = {
      id: `disp-${Date.now()}`,
      dispatchMethod: dispatchMethod || "EMAIL",
      recipientEmail: recipientEmail || existing.vendor?.email || "vendor@partner.com",
      recipientContact: existing.vendor?.phone || "+91 98000 00000",
      message: message || "PO dispatched to vendor via portal.",
      status: "SENT",
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...existing,
      status: newStatus,
      approvalLevel: nextLevel,
      approvals: action === "APPROVE" || action === "REJECT"
        ? [...(existing.approvals || []), newApproval]
        : existing.approvals,
      dispatches: action === "DISPATCH"
        ? [...(existing.dispatches || []), newDispatch]
        : existing.dispatches,
    };

    // Save in memory
    if (poIndex !== -1) {
      MOCK_PURCHASE_ORDERS[poIndex] = updated;
    }

    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: userEmail || "manager@purchaseflow.com",
      userName: userName || "Kavita Singh",
      userRole: userRole || "PURCHASE_MANAGER",
      action: action === "DISPATCH" ? "Dispatched PO" : `PO ${action}`,
      entity: "PurchaseOrder",
      entityId: existing.poNo,
      previousStatus: existing.status,
      newStatus,
      details: comments || message || `PO ${existing.poNo} status updated to ${newStatus}`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    if (newStatus === "APPROVED") {
      MOCK_NOTIFICATIONS.unshift({
        id: `n-${Date.now()}`,
        title: `PO ${existing.poNo} Fully Approved`,
        message: `PO ${existing.poNo} for ${existing.vendor?.name} has received full approval and is ready for dispatch.`,
        type: "SUCCESS",
        recipientRole: "PURCHASE_EXECUTIVE",
        isRead: false,
        linkUrl: "/purchase/po-dispatch",
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update PO:", error);
    return NextResponse.json({ error: "Failed to update PO" }, { status: 500 });
  }
}
