import { NextResponse } from "next/server";
import { MOCK_LOGISTICS, MOCK_VENDORS, MOCK_PURCHASE_ORDERS, MOCK_AUDIT_LOGS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(MOCK_LOGISTICS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `log-${Date.now()}`;
    const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];
    const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === body.poId || p.poNo === body.poId) || MOCK_PURCHASE_ORDERS[0];

    const newLogistics = {
      id,
      poId: po.id,
      po: { poNo: po.poNo },
      vendorId: vendor.id,
      vendor,
      dispatchDate: new Date(body.dispatchDate || Date.now()).toISOString(),
      vehicleNo: body.vehicleNo || "MH-12 AB 9999",
      vehicleType: body.vehicleType || "Container Truck",
      transporter: body.transporter || "VRL Logistics",
      driverName: body.driverName || "Driver Name",
      driverPhone: body.driverPhone || "+91 98000 00000",
      freight: Number(body.freight) || 0,
      expectedArrival: new Date(Date.now() + 3 * 86400000).toISOString(),
      trackingNo: body.trackingNo || `TRK-${Date.now()}`,
      status: body.status || "DISPATCHED",
      createdAt: new Date().toISOString(),
    };

    // Save in memory
    MOCK_LOGISTICS.unshift(newLogistics);

    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: body.userEmail || "store@purchaseflow.com",
      userName: body.userName || "Ramesh Gupta",
      userRole: body.userRole || "STORE_MANAGER",
      action: "Created Logistics Arrangement",
      entity: "Logistics",
      entityId: po.poNo,
      previousStatus: "LOGISTICS_PENDING",
      newStatus: newLogistics.status,
      details: `Transporter: ${newLogistics.transporter}, Vehicle: ${newLogistics.vehicleNo}`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newLogistics, { status: 201 });
  } catch (error) {
    console.error("Error creating logistics:", error);
    return NextResponse.json({ error: "Failed to create logistics entry" }, { status: 500 });
  }
}
