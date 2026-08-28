import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, createNotification } from "@/lib/services/audit-notification";

export async function GET() {
  try {
    const receipts = await prisma.materialReceipt.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        po: { include: { items: true } },
        vendor: true,
        warehouse: true,
        items: { include: { material: true } },
        inspections: true,
      },
    });
    return NextResponse.json(receipts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch GRN material receipts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.materialReceipt.count();
    const grnNo = `GRN-2026-${String(count + 1).padStart(4, "0")}`;

    const items = body.items || [];
    const warehouseId = body.warehouseId || (await prisma.warehouse.findFirst())?.id || "";

    const receiptItemsData = items.map((it: any) => {
      const ord = Number(it.orderedQty) || 100;
      const rec = Number(it.receivedQty) || ord;
      const rej = Number(it.rejectedQty) || 0;
      const dam = Number(it.damagedQty) || 0;
      const acc = rec - rej - dam;

      return {
        materialId: it.materialId,
        orderedQty: ord,
        receivedQty: rec,
        acceptedQty: Math.max(0, acc),
        rejectedQty: rej,
        damagedQty: dam,
        batchNo: it.batchNo || `BATCH-2026-${Date.now().toString().slice(-4)}`,
        remarks: it.remarks || null,
      };
    });

    const receipt = await prisma.materialReceipt.create({
      data: {
        grnNo,
        poId: body.poId,
        vendorId: body.vendorId,
        receiptDate: new Date(body.receiptDate || Date.now()),
        warehouseId,
        vehicleNo: body.vehicleNo || null,
        invoiceNo: body.invoiceNo || null,
        receivedByName: body.userName || "Ramesh Gupta",
        remarks: body.remarks || "Goods received and stored at warehouse.",
        status: "COMPLETED",
        items: {
          create: receiptItemsData,
        },
      },
      include: { po: true, vendor: true, warehouse: true, items: true },
    });

    // Create Quality Inspections & Update Inventory Stock automatically!
    for (const item of receiptItemsData) {
      // 1. Create Quality Inspection
      await prisma.qualityInspection.create({
        data: {
          receiptId: receipt.id,
          materialId: item.materialId,
          batchNo: item.batchNo,
          inspectedQty: item.receivedQty,
          passedQty: item.acceptedQty,
          failedQty: item.rejectedQty + item.damagedQty,
          inspectorName: body.userName || "Ramesh Gupta",
          qualityStatus: item.rejectedQty > 0 ? "PARTIALLY_PASSED" : "PASSED",
          remarks: "Standard quality inspection completed upon GRN entry.",
        },
      });

      // 2. Update Inventory Stock
      const existingInventory = await prisma.inventory.findFirst({
        where: { materialId: item.materialId, warehouseId },
      });

      if (existingInventory) {
        const newReceived = existingInventory.receivedStock + item.acceptedQty;
        const newAvailable = existingInventory.openingStock + newReceived - existingInventory.issuedStock - existingInventory.reservedStock;

        await prisma.inventory.update({
          where: { id: existingInventory.id },
          data: {
            receivedStock: newReceived,
            availableStock: newAvailable,
          },
        });
      }

      // 3. Log Stock Movement
      await prisma.stockMovement.create({
        data: {
          materialId: item.materialId,
          warehouseId,
          movementType: "INBOUND_GRN",
          quantity: item.acceptedQty,
          referenceType: "GRN",
          referenceNo: receipt.grnNo,
          createdByName: body.userName || "Ramesh Gupta",
          remarks: `GRN inbound stock entry ${receipt.grnNo}`,
        },
      });
    }

    // Check PO completion status
    if (body.poId) {
      await prisma.purchaseOrder.update({
        where: { id: body.poId },
        data: { status: "COMPLETED" },
      });
    }

    await createAuditLog({
      userEmail: body.userEmail || "store@purchaseflow.com",
      userName: body.userName || "Ramesh Gupta",
      userRole: body.userRole || "STORE_MANAGER",
      action: "Created GRN & Stock Entry",
      entity: "MaterialReceipt",
      entityId: receipt.grnNo,
      previousStatus: "PENDING",
      newStatus: "COMPLETED",
      details: `Created GRN ${receipt.grnNo} for PO ${receipt.po.poNo} and updated inventory stock.`,
    });

    await createNotification({
      title: `GRN ${receipt.grnNo} Created`,
      message: `Goods received against PO ${receipt.po.poNo}. Inventory stock updated.`,
      type: "SUCCESS",
      recipientRole: "PURCHASE_MANAGER",
      linkUrl: "/purchase/stock",
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error("Error creating GRN:", error);
    return NextResponse.json({ error: "Failed to create GRN material receipt" }, { status: 500 });
  }
}
