import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, createNotification } from "@/lib/services/audit-notification";

export async function GET() {
  try {
    const indents = await prisma.purchaseIndent.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        department: true,
        items: { include: { material: true, unit: true } },
        approvals: true,
        quotations: true,
      },
    });
    return NextResponse.json(indents);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch purchase indents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.purchaseIndent.count();
    const indentNo = `IND-2026-${String(count + 1).padStart(4, "0")}`;

    const items = body.items || [];
    const totalEst = items.reduce(
      (acc: number, item: any) => acc + (Number(item.quantity) || 0) * (Number(item.estimatedRate) || 0),
      0
    );

    const plannedDate = new Date(Date.now() + 86400000); // 1 day TAT

    const indent = await prisma.purchaseIndent.create({
      data: {
        indentNo,
        indentDate: new Date(body.indentDate || Date.now()),
        departmentId: body.departmentId,
        requestedById: body.requestedById || "EMP-003",
        requestedByName: body.requestedByName || "Amit Patel",
        requiredDate: new Date(body.requiredDate || Date.now() + 7 * 86400000),
        priority: body.priority || "MEDIUM",
        purpose: body.purpose || "General Operational Procurement",
        remarks: body.remarks || null,
        status: body.status || "SUBMITTED",
        totalEstimatedAmount: totalEst,
        plannedDate,
        items: {
          create: items.map((it: any) => ({
            materialId: it.materialId,
            description: it.description || null,
            quantity: Number(it.quantity),
            unitId: it.unitId,
            estimatedRate: Number(it.estimatedRate),
            estimatedAmount: Number(it.quantity) * Number(it.estimatedRate),
          })),
        },
      },
      include: { department: true, items: true },
    });

    await createAuditLog({
      userEmail: body.userEmail || "executive@purchaseflow.com",
      userName: body.userName || "Amit Patel",
      userRole: body.userRole || "PURCHASE_EXECUTIVE",
      action: "Created Indent",
      entity: "PurchaseIndent",
      entityId: indent.indentNo,
      previousStatus: "NONE",
      newStatus: indent.status,
      details: `Created purchase indent ${indent.indentNo} with total estimate ₹${totalEst.toLocaleString("en-IN")}`,
    });

    if (indent.status === "SUBMITTED") {
      await createNotification({
        title: `New Indent ${indent.indentNo} submitted`,
        message: `Indent ${indent.indentNo} submitted by ${indent.requestedByName} awaiting department approval.`,
        type: "INFO",
        recipientRole: "DEPARTMENT_HEAD",
        linkUrl: "/purchase/approval",
      });
    }

    return NextResponse.json(indent, { status: 201 });
  } catch (error) {
    console.error("Error creating indent:", error);
    return NextResponse.json({ error: "Failed to create purchase indent" }, { status: 500 });
  }
}
