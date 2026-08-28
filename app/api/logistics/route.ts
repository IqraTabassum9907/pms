import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit-notification";

export async function GET() {
  try {
    const logistics = await prisma.logistics.findMany({
      orderBy: { createdAt: "desc" },
      include: { po: true, vendor: true },
    });
    return NextResponse.json(logistics);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logistics data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { poId, vendorId, dispatchDate, vehicleNo, vehicleType, transporter, driverName, driverPhone, freight, trackingNo, status, userEmail, userName, userRole } = body;

    const record = await prisma.logistics.create({
      data: {
        poId,
        vendorId,
        dispatchDate: new Date(dispatchDate || Date.now()),
        vehicleNo: vehicleNo || "MH-12 AB 9999",
        vehicleType: vehicleType || "Container Truck",
        transporter: transporter || "VRL Logistics",
        driverName: driverName || "Driver Name",
        driverPhone: driverPhone || "+91 98000 00000",
        freight: Number(freight) || 0,
        expectedArrival: new Date(Date.now() + 3 * 86400000),
        trackingNo: trackingNo || `TRK-${Date.now()}`,
        status: status || "DISPATCHED",
      },
      include: { po: true, vendor: true },
    });

    await createAuditLog({
      userEmail: userEmail || "store@purchaseflow.com",
      userName: userName || "Ramesh Gupta",
      userRole: userRole || "STORE_MANAGER",
      action: "Created Logistics Arrangement",
      entity: "Logistics",
      entityId: record.po.poNo,
      previousStatus: "LOGISTICS_PENDING",
      newStatus: record.status,
      details: `Transporter: ${record.transporter}, Vehicle: ${record.vehicleNo}`,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create logistics entry" }, { status: 500 });
  }
}
