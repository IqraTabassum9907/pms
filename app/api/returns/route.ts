import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit-notification";

export async function GET() {
  try {
    const returns = await prisma.purchaseReturn.findMany({
      orderBy: { createdAt: "desc" },
      include: { po: true, vendor: true, receipt: true },
    });
    return NextResponse.json(returns);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch purchase returns" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.purchaseReturn.count();
    const returnNo = `RET-2026-${String(count + 1).padStart(4, "0")}`;

    const ret = await prisma.purchaseReturn.create({
      data: {
        returnNo,
        poId: body.poId,
        receiptId: body.receiptId || null,
        vendorId: body.vendorId,
        returnDate: new Date(),
        reason: body.reason || "Damaged/Defective materials rejected during quality inspection.",
        totalReturnAmount: Number(body.totalReturnAmount) || 15000,
        status: "APPROVED",
        createdByName: body.userName || "Ramesh Gupta",
      },
      include: { po: true, vendor: true },
    });

    await createAuditLog({
      userEmail: body.userEmail || "store@purchaseflow.com",
      userName: body.userName || "Ramesh Gupta",
      userRole: body.userRole || "STORE_MANAGER",
      action: "Created Purchase Return",
      entity: "PurchaseReturn",
      entityId: ret.returnNo,
      previousStatus: "NONE",
      newStatus: "APPROVED",
      details: `Returned materials worth ₹${ret.totalReturnAmount.toLocaleString("en-IN")} to ${ret.vendor.name}`,
    });

    return NextResponse.json(ret, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create purchase return" }, { status: 500 });
  }
}
