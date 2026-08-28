import { NextResponse } from "next/server";
import { MOCK_PURCHASE_ORDERS, MOCK_VENDORS, MOCK_DEPARTMENTS, MOCK_MATERIALS, MOCK_UNITS, MOCK_DASHBOARD, MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(MOCK_PURCHASE_ORDERS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `po-${Date.now()}`;
    const count = MOCK_PURCHASE_ORDERS.length + 1;
    const poNo = `PO-2026-${String(count).padStart(4, "0")}`;

    const items = body.items || [];
    const freight = Number(body.freight) || 0;
    const discount = Number(body.discount) || 0;
    const otherCharges = Number(body.otherCharges) || 0;

    let subTotal = 0;
    let totalGst = 0;

    const poItemsData = items.map((it: any, idx: number) => {
      const mat = MOCK_MATERIALS.find((m) => m.id === it.materialId) || MOCK_MATERIALS[0];
      const unit = MOCK_UNITS.find((u) => u.id === it.unitId) || MOCK_UNITS[0];
      const qty = Number(it.quantity) || 1;
      const rate = Number(it.rate) || mat.estimatedRate || 100;
      const disc = Number(it.discountPercent) || 0;
      const gst = Number(it.gstPercent) || 18;
      const taxable = qty * rate * (1 - disc / 100);
      const gstAmt = taxable * (gst / 100);
      const itemTotal = taxable + gstAmt;
      subTotal += taxable;
      totalGst += gstAmt;
      return {
        id: `poi-${Date.now()}-${idx}`,
        materialId: it.materialId || mat.id,
        material: mat,
        quantity: qty,
        unitId: it.unitId || unit.id,
        unit,
        rate,
        discountPercent: disc,
        gstPercent: gst,
        gstAmount: gstAmt,
        totalAmount: itemTotal,
      };
    });

    const grandTotal = subTotal + totalGst + freight + otherCharges - discount;
    const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];
    const department = MOCK_DEPARTMENTS.find((d) => d.id === body.departmentId) || MOCK_DEPARTMENTS[2];

    const newPO = {
      id,
      poNo,
      poDate: new Date(body.poDate || Date.now()).toISOString(),
      vendorId: vendor.id,
      vendor,
      indentId: body.indentId || null,
      indent: body.indentId ? { indentNo: body.indentId } : null,
      departmentId: department.id,
      department,
      deliveryAddress: body.deliveryAddress || "Central Warehouse Mumbai, Plot 42, Bhiwandi, Thane, MH",
      billingAddress: body.billingAddress || "Headquarters, PurchaseFlow Corp, Worli, Mumbai 400018",
      paymentTerms: body.paymentTerms || "Net 30 Days",
      deliveryTerms: body.deliveryTerms || "FOR Destination",
      expectedDeliveryDate: new Date(body.expectedDeliveryDate || Date.now() + 14 * 86400000).toISOString(),
      freight,
      discount,
      gstAmount: totalGst,
      otherCharges,
      grandTotal,
      status: body.status || "PENDING_APPROVAL",
      approvalLevel: 1,
      plannedDate: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      items: poItemsData,
      approvals: [],
      dispatches: [],
      payments: [],
      receipts: [],
    };

    // Save into in-memory array so it immediately appears everywhere
    MOCK_PURCHASE_ORDERS.unshift(newPO);

    // Update KPIs
    MOCK_DASHBOARD.kpis.pendingPOs += 1;
    MOCK_DASHBOARD.kpis.totalPurchaseValue += grandTotal;

    // Add Audit Log
    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: body.userEmail || "executive@purchaseflow.com",
      userName: body.userName || "Amit Patel",
      userRole: body.userRole || "PURCHASE_EXECUTIVE",
      action: "Created PO",
      entity: "PurchaseOrder",
      entityId: newPO.poNo,
      previousStatus: "NONE",
      newStatus: newPO.status,
      details: `Created Purchase Order ${newPO.poNo} for ${vendor.name} totaling ₹${grandTotal.toLocaleString("en-IN")}`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    // Add Notification
    MOCK_NOTIFICATIONS.unshift({
      id: `n-${Date.now()}`,
      title: `New PO ${newPO.poNo} Pending Approval`,
      message: `Purchase order ${newPO.poNo} created for ₹${grandTotal.toLocaleString("en-IN")} awaiting approval.`,
      type: "URGENT",
      recipientRole: "PURCHASE_MANAGER",
      isRead: false,
      linkUrl: "/purchase/po-approval",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newPO, { status: 201 });
  } catch (error) {
    console.error("Error creating PO:", error);
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}
