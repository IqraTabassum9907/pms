import { NextResponse } from "next/server";
import { MOCK_INDENTS, MOCK_DEPARTMENTS, MOCK_MATERIALS, MOCK_UNITS, MOCK_DASHBOARD, MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(MOCK_INDENTS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `ind-${Date.now()}`;
    const count = MOCK_INDENTS.length + 1;
    const indentNo = `IND-2026-${String(count).padStart(4, "0")}`;

    const items = body.items || [];
    const totalEst = items.reduce(
      (acc: number, item: any) => acc + (Number(item.quantity) || 0) * (Number(item.estimatedRate) || 0),
      0
    );

    const department = MOCK_DEPARTMENTS.find((d) => d.id === body.departmentId) || MOCK_DEPARTMENTS[0];

    const newIndent = {
      id,
      indentNo,
      indentDate: new Date(body.indentDate || Date.now()).toISOString(),
      departmentId: body.departmentId || department.id,
      department,
      requestedById: body.requestedById || "emp2",
      requestedByName: body.requestedByName || "Amit Patel",
      requiredDate: new Date(body.requiredDate || Date.now() + 7 * 86400000).toISOString(),
      priority: body.priority || "MEDIUM",
      purpose: body.purpose || "General Operational Procurement",
      remarks: body.remarks || null,
      status: body.status || "SUBMITTED",
      totalEstimatedAmount: totalEst,
      plannedDate: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      items: items.map((it: any, idx: number) => {
        const mat = MOCK_MATERIALS.find((m) => m.id === it.materialId) || MOCK_MATERIALS[0];
        const unit = MOCK_UNITS.find((u) => u.id === it.unitId) || MOCK_UNITS[0];
        const qty = Number(it.quantity) || 1;
        const rate = Number(it.estimatedRate) || mat.estimatedRate || 100;
        return {
          id: `ii-${Date.now()}-${idx}`,
          materialId: it.materialId || mat.id,
          material: mat,
          quantity: qty,
          unitId: it.unitId || unit.id,
          unit,
          estimatedRate: rate,
          estimatedAmount: qty * rate,
        };
      }),
      approvals: [],
      quotations: [],
    };

    // Save into in-memory array so it immediately appears in all views
    MOCK_INDENTS.unshift(newIndent);

    // Update KPI counter
    if (newIndent.status === "SUBMITTED" || newIndent.status === "UNDER_REVIEW") {
      MOCK_DASHBOARD.kpis.pendingIndents += 1;
    }

    // Add Audit Log
    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: body.userEmail || "executive@purchaseflow.com",
      userName: body.userName || "Amit Patel",
      userRole: body.userRole || "PURCHASE_EXECUTIVE",
      action: "Created Indent",
      entity: "PurchaseIndent",
      entityId: newIndent.indentNo,
      previousStatus: "NONE",
      newStatus: newIndent.status,
      details: `Created purchase indent ${newIndent.indentNo} with estimate ₹${totalEst.toLocaleString("en-IN")}`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    // Add Notification
    MOCK_NOTIFICATIONS.unshift({
      id: `n-${Date.now()}`,
      title: `New Indent ${newIndent.indentNo} Created`,
      message: `Indent ${newIndent.indentNo} for ${department.name} department created.`,
      type: "INFO",
      recipientRole: "DEPARTMENT_HEAD",
      isRead: false,
      linkUrl: "/purchase/approval",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newIndent, { status: 201 });
  } catch (error) {
    console.error("Error creating indent:", error);
    return NextResponse.json({ error: "Failed to create indent" }, { status: 500 });
  }
}
