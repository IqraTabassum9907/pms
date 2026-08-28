import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, createNotification } from "@/lib/services/audit-notification";

export async function GET() {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendor: true,
        indent: true,
        department: true,
        items: { include: { material: true, unit: true } },
        approvals: true,
        dispatches: true,
        payments: true,
        receipts: true,
      },
    });
    return NextResponse.json(pos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.purchaseOrder.count();
    const poNo = `PO-2026-${String(count + 1).padStart(4, "0")}`;

    const items = body.items || [];
    const freight = Number(body.freight) || 0;
    const discount = Number(body.discount) || 0;
    const otherCharges = Number(body.otherCharges) || 0;

    let subTotal = 0;
    let totalGst = 0;

    const poItemsData = items.map((it: any) => {
      const qty = Number(it.quantity) || 1;
      const rate = Number(it.rate) || 0;
      const disc = Number(it.discountPercent) || 0;
      const gst = Number(it.gstPercent) || 18;

      const taxable = qty * rate * (1 - disc / 100);
      const gstAmt = taxable * (gst / 100);
      const itemTotal = taxable + gstAmt;

      subTotal += taxable;
      totalGst += gstAmt;

      return {
        materialId: it.materialId,
        description: it.description || null,
        quantity: qty,
        unitId: it.unitId,
        rate: rate,
        discountPercent: disc,
        gstPercent: gst,
        gstAmount: gstAmt,
        totalAmount: itemTotal,
      };
    });

    const grandTotal = subTotal + totalGst + freight + otherCharges - discount;
    const plannedDate = new Date(Date.now() + 86400000); // 1 day PO approval TAT

    const po = await prisma.purchaseOrder.create({
      data: {
        poNo,
        poDate: new Date(body.poDate || Date.now()),
        vendorId: body.vendorId,
        indentId: body.indentId || null,
        quotationId: body.quotationId || null,
        departmentId: body.departmentId || "DEP-PUR",
        deliveryAddress: body.deliveryAddress || "Central Warehouse Mumbai, Plot 42, Bhiwandi, Thane, MH",
        billingAddress: body.billingAddress || "Headquarters, PurchaseFlow Corp, Worli, Mumbai 400018",
        paymentTerms: body.paymentTerms || "Net 30 Days",
        deliveryTerms: body.deliveryTerms || "FOR Destination",
        expectedDeliveryDate: new Date(body.expectedDeliveryDate || Date.now() + 14 * 86400000),
        freight,
        discount,
        gstAmount: totalGst,
        otherCharges,
        grandTotal,
        status: body.status || "PENDING_APPROVAL",
        approvalLevel: 1,
        plannedDate,
        items: {
          create: poItemsData,
        },
      },
      include: { vendor: true, department: true, items: true },
    });

    await createAuditLog({
      userEmail: body.userEmail || "executive@purchaseflow.com",
      userName: body.userName || "Amit Patel",
      userRole: body.userRole || "PURCHASE_EXECUTIVE",
      action: "Created PO",
      entity: "PurchaseOrder",
      entityId: po.poNo,
      previousStatus: "NONE",
      newStatus: po.status,
      details: `Created Purchase Order ${po.poNo} for vendor ${po.vendor.name} totaling ₹${grandTotal.toLocaleString("en-IN")}`,
    });

    await createNotification({
      title: `New PO ${po.poNo} Pending Approval`,
      message: `Purchase order ${po.poNo} created for ₹${grandTotal.toLocaleString("en-IN")} awaiting approval.`,
      type: "URGENT",
      recipientRole: "PURCHASE_MANAGER",
      linkUrl: "/purchase/po-approval",
    });

    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    console.error("Error creating PO:", error);
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}
