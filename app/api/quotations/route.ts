import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit-notification";

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendor: true,
        indent: { include: { department: true } },
        items: { include: { material: true } },
      },
    });
    return NextResponse.json(quotations);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.quotation.count();
    const quotationNo = `QUO-2026-${String(count + 1).padStart(4, "0")}`;

    const items = body.items || [];
    const freight = Number(body.freight) || 0;
    const discountAmount = Number(body.discountAmount) || 0;

    let itemsTotal = 0;
    const quotationItemsData = items.map((it: any) => {
      const qty = Number(it.quantity) || 1;
      const rate = Number(it.rate) || 0;
      const disc = Number(it.discountPercent) || 0;
      const gst = Number(it.gstPercent) || 18;
      const amt = qty * rate * (1 - disc / 100);
      const total = amt * (1 + gst / 100);
      itemsTotal += total;
      return {
        materialId: it.materialId,
        quantity: qty,
        rate: rate,
        discountPercent: disc,
        gstPercent: gst,
        amount: amt,
        total: total,
      };
    });

    const grandTotal = itemsTotal + freight - discountAmount;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNo,
        quotationDate: new Date(body.quotationDate || Date.now()),
        vendorId: body.vendorId,
        indentId: body.indentId,
        validUntil: new Date(body.validUntil || Date.now() + 30 * 86400000),
        paymentTerms: body.paymentTerms || "Net 30 Days",
        deliveryTerms: body.deliveryTerms || "FOR Destination",
        freight,
        taxAmount: itemsTotal * 0.18,
        discountAmount,
        totalAmount: grandTotal,
        remarks: body.remarks || null,
        status: "RECEIVED",
        items: {
          create: quotationItemsData,
        },
      },
      include: { vendor: true, indent: true, items: true },
    });

    await createAuditLog({
      userEmail: body.userEmail || "executive@purchaseflow.com",
      userName: body.userName || "Amit Patel",
      userRole: body.userRole || "PURCHASE_EXECUTIVE",
      action: "Recorded Quotation",
      entity: "Quotation",
      entityId: quotation.quotationNo,
      previousStatus: "NONE",
      newStatus: "RECEIVED",
      details: `Recorded quote ${quotation.quotationNo} from ${quotation.vendor.name} totaling ₹${grandTotal.toLocaleString("en-IN")}`,
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}
