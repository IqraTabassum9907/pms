import { NextResponse } from "next/server";
import { MOCK_QUOTATIONS, MOCK_VENDORS, MOCK_INDENTS, MOCK_MATERIALS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(MOCK_QUOTATIONS);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `q-${Date.now()}`;
  const count = MOCK_QUOTATIONS.length + 1;
  const quotationNo = `QUO-2026-${String(count).padStart(4, "0")}`;

  const items = body.items || [];
  const freight = Number(body.freight) || 0;
  const discountAmount = Number(body.discountAmount) || 0;
  let itemsTotal = 0;

  const quotationItemsData = items.map((it: any, idx: number) => {
    const qty = Number(it.quantity) || 1;
    const rate = Number(it.rate) || 0;
    const disc = Number(it.discountPercent) || 0;
    const gst = Number(it.gstPercent) || 18;
    const amt = qty * rate * (1 - disc / 100);
    const total = amt * (1 + gst / 100);
    itemsTotal += total;
    return {
      id: `qi-${Date.now()}-${idx}`,
      materialId: it.materialId,
      material: MOCK_MATERIALS.find((m) => m.id === it.materialId) || MOCK_MATERIALS[0],
      quantity: qty,
      rate,
      discountPercent: disc,
      gstPercent: gst,
      amount: amt,
      total,
    };
  });

  const grandTotal = itemsTotal + freight - discountAmount;
  const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];
  const indent = MOCK_INDENTS.find((i) => i.id === body.indentId) || null;

  return NextResponse.json(
    {
      id,
      quotationNo,
      quotationDate: new Date(body.quotationDate || Date.now()).toISOString(),
      vendorId: vendor.id,
      vendor,
      indentId: body.indentId || null,
      indent,
      validUntil: new Date(body.validUntil || Date.now() + 30 * 86400000).toISOString(),
      paymentTerms: body.paymentTerms || "Net 30 Days",
      deliveryTerms: body.deliveryTerms || "FOR Destination",
      freight,
      taxAmount: itemsTotal * 0.18,
      discountAmount,
      totalAmount: grandTotal,
      remarks: body.remarks || null,
      status: "RECEIVED",
      createdAt: new Date().toISOString(),
      items: quotationItemsData,
    },
    { status: 201 }
  );
}
