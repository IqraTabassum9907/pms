import { NextResponse } from "next/server";
import { MOCK_LOGISTICS, MOCK_VENDORS, MOCK_PURCHASE_ORDERS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_LOGISTICS);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `log-${Date.now()}`;
  const vendor = MOCK_VENDORS.find((v) => v.id === body.vendorId) || MOCK_VENDORS[0];
  const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === body.poId) || MOCK_PURCHASE_ORDERS[0];

  return NextResponse.json(
    {
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
    },
    { status: 201 }
  );
}
