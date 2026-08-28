import { NextResponse } from "next/server";
import {
  MOCK_RECEIPTS,
  MOCK_VENDORS,
  MOCK_WAREHOUSES,
  MOCK_MATERIALS,
  MOCK_STOCK,
  MOCK_STOCK_MOVEMENTS,
  MOCK_PURCHASE_ORDERS,
  MOCK_DASHBOARD,
  MOCK_AUDIT_LOGS,
  MOCK_NOTIFICATIONS,
} from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(MOCK_RECEIPTS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `grn-${Date.now()}`;
    const count = MOCK_RECEIPTS.length + 1;
    const grnNo = `GRN-2026-${String(count).padStart(4, "0")}`;

    const items = body.items || [];
    const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];
    const warehouse = MOCK_WAREHOUSES.find((w) => w.id === body.warehouseId) || MOCK_WAREHOUSES[0];
    const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === body.poId || p.poNo === body.poId);

    const receiptItems = items.map((it: any, idx: number) => {
      const mat = MOCK_MATERIALS.find((m) => m.id === it.materialId) || MOCK_MATERIALS[0];
      const ord = Number(it.orderedQty) || 100;
      const rec = Number(it.receivedQty) || ord;
      const rej = Number(it.rejectedQty) || 0;
      const dam = Number(it.damagedQty) || 0;
      const acc = Math.max(0, rec - rej - dam);
      return {
        id: `gi-${Date.now()}-${idx}`,
        materialId: it.materialId || mat.id,
        material: mat,
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
      poId: po?.id || body.poId || "po1",
      po: { poNo: po?.poNo || "PO-2026-0001", items: [] },
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

    // Save in memory
    MOCK_RECEIPTS.unshift(newReceipt);

    // Update Stock & Inventory in memory
    receiptItems.forEach((ri) => {
      const stockItem = MOCK_STOCK.find((s) => s.materialId === ri.materialId);
      if (stockItem) {
        stockItem.receivedStock += ri.acceptedQty;
        stockItem.availableStock += ri.acceptedQty;
      }
      MOCK_STOCK_MOVEMENTS.unshift({
        id: `sm-${Date.now()}-${ri.materialId}`,
        materialId: ri.materialId,
        material: ri.material,
        warehouseId: warehouse.id,
        warehouse,
        movementType: "INBOUND_GRN",
        quantity: ri.acceptedQty,
        referenceType: "GRN",
        referenceNo: newReceipt.grnNo,
        createdByName: body.userName || "Ramesh Gupta",
        remarks: `GRN inbound stock entry against ${po?.poNo || "PO"}`,
        movementDate: new Date().toISOString(),
      });
    });

    // Mark PO as COMPLETED
    if (po) {
      po.status = "COMPLETED";
      MOCK_DASHBOARD.kpis.completedPurchases += 1;
      if (MOCK_DASHBOARD.kpis.materialAwaitingReceipt > 0) {
        MOCK_DASHBOARD.kpis.materialAwaitingReceipt -= 1;
      }
    }

    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: body.userEmail || "store@purchaseflow.com",
      userName: body.userName || "Ramesh Gupta",
      userRole: body.userRole || "STORE_MANAGER",
      action: "Created GRN & Stock Entry",
      entity: "MaterialReceipt",
      entityId: newReceipt.grnNo,
      previousStatus: "PENDING",
      newStatus: "COMPLETED",
      details: `Created GRN ${newReceipt.grnNo} for ${vendor.name} and updated inventory stock.`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    MOCK_NOTIFICATIONS.unshift({
      id: `n-${Date.now()}`,
      title: `GRN ${newReceipt.grnNo} Created`,
      message: `Goods received against ${po?.poNo || "PO"}. Inventory stock updated.`,
      type: "SUCCESS",
      recipientRole: "PURCHASE_MANAGER",
      isRead: false,
      linkUrl: "/purchase/stock",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newReceipt, { status: 201 });
  } catch (error) {
    console.error("Error creating GRN:", error);
    return NextResponse.json({ error: "Failed to create GRN receipt" }, { status: 500 });
  }
}
