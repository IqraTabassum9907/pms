import { NextResponse } from "next/server";
import { MOCK_RECEIPTS, MOCK_VENDORS, MOCK_WAREHOUSES, MOCK_MATERIALS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_RECEIPTS);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `grn-${Date.now()}`;
  const count = MOCK_RECEIPTS.length + 1;
  const grnNo = `GRN-2026-${String(count).padStart(4, "0")}`;

  const items = body.items || [];
  const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];
  const warehouse = MOCK_WAREHOUSES.find((w) => w.id === body.warehouseId) || MOCK_WAREHOUSES[0];

  const receiptItems = items.map((it: any, idx: number) => {
    const ord = Number(it.orderedQty) || 100;
    const rec = Number(it.receivedQty) || ord;
    const rej = Number(it.rejectedQty) || 0;
    const dam = Number(it.damagedQty) || 0;
    const acc = Math.max(0, rec - rej - dam);
    return {
      id: `gi-${Date.now()}-${idx}`,
      materialId: it.materialId,
      material: MOCK_MATERIALS.find((m) => m.id === it.materialId) || MOCK_MATERIALS[0],
      orderedQty: ord,
      receivedQty: rec,
      acceptedQty: acc,
      rejectedQty: rej,
      damagedQty: dam,
      batchNo: it.batchNo || `BATCH-2026-${Date.now().toString().slice(-4)}`,
      remarks: it.remarks || null,
    };
  });

  const newReceipt = {
    id,
    grnNo,
    poId: body.poId,
    po: { poNo: body.poId || "PO-2026-0001", items: [] },
    vendorId: vendor.id,
    vendor,
    receiptDate: new Date(body.receiptDate || Date.now()).toISOString(),
    warehouseId: warehouse.id,
    warehouse,
    vehicleNo: body.vehicleNo || null,
    invoiceNo: body.invoiceNo || null,
    receivedByName: body.userName || "Ramesh Gupta",
    remarks: body.remarks || "Goods received and stored at warehouse.",
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
    items: receiptItems,
    inspections: receiptItems.map((ri: any, idx: number) => ({
      id: `insp-${Date.now()}-${idx}`,
      qualityStatus: ri.rejectedQty > 0 ? "PARTIALLY_PASSED" : "PASSED",
      inspectedQty: ri.receivedQty,
      passedQty: ri.acceptedQty,
      failedQty: ri.rejectedQty + ri.damagedQty,
      inspectorName: body.userName || "Dr. Anand Rao",
      remarks: "Standard quality inspection completed upon GRN entry.",
    })),
  };

  return NextResponse.json(newReceipt, { status: 201 });
}
