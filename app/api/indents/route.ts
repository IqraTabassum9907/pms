import { NextResponse } from "next/server";
import { MOCK_INDENTS, MOCK_DEPARTMENTS, MOCK_MATERIALS, MOCK_UNITS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(MOCK_INDENTS);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `ind-${Date.now()}`;
  const count = MOCK_INDENTS.length + 1;
  const indentNo = `IND-2026-${String(count).padStart(4, "0")}`;

  const items = body.items || [];
  const totalEst = items.reduce(
    (acc: number, item: any) => acc + (Number(item.quantity) || 0) * (Number(item.estimatedRate) || 0),
    0
  );

  const department = MOCK_DEPARTMENTS.find((d) => d.id === body.departmentId) || MOCK_DEPARTMENTS[0];

  const newIndent = {
    id,
    indentNo,
    indentDate: new Date(body.indentDate || Date.now()).toISOString(),
    departmentId: body.departmentId || department.id,
    department,
    requestedById: body.requestedById || "emp2",
    requestedByName: body.requestedByName || "Amit Patel",
    requiredDate: new Date(body.requiredDate || Date.now() + 7 * 86400000).toISOString(),
    priority: body.priority || "MEDIUM",
    purpose: body.purpose || "General Operational Procurement",
    remarks: body.remarks || null,
    status: body.status || "SUBMITTED",
    totalEstimatedAmount: totalEst,
    plannedDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    items: items.map((it: any, idx: number) => ({
      id: `ii-${Date.now()}-${idx}`,
      materialId: it.materialId,
      material: MOCK_MATERIALS.find((m) => m.id === it.materialId) || MOCK_MATERIALS[0],
      quantity: Number(it.quantity),
      unitId: it.unitId,
      unit: MOCK_UNITS.find((u) => u.id === it.unitId) || MOCK_UNITS[0],
      estimatedRate: Number(it.estimatedRate),
      estimatedAmount: Number(it.quantity) * Number(it.estimatedRate),
    })),
    approvals: [],
    quotations: [],
  };

  return NextResponse.json(newIndent, { status: 201 });
}
