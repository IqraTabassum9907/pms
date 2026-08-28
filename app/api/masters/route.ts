import { NextResponse } from "next/server";
import {
  MOCK_VENDORS,
  MOCK_MATERIALS,
  MOCK_CATEGORIES,
  MOCK_UNITS,
  MOCK_WAREHOUSES,
  MOCK_DEPARTMENTS,
  MOCK_EMPLOYEES,
} from "@/lib/mock-data";

const MOCK_TAX = [
  { id: "tax1", name: "GST 5%", rate: 5, type: "GST" },
  { id: "tax2", name: "GST 12%", rate: 12, type: "GST" },
  { id: "tax3", name: "GST 18%", rate: 18, type: "GST" },
  { id: "tax4", name: "GST 28%", rate: 28, type: "GST" },
];

const MOCK_PAYMENT_TERMS = [
  { id: "pt1", name: "Advance 100%", days: 0, description: "Full advance payment required" },
  { id: "pt2", name: "Advance 50%", days: 0, description: "50% advance, 50% on delivery" },
  { id: "pt3", name: "Net 30 Days", days: 30, description: "Payment within 30 days of invoice" },
  { id: "pt4", name: "Net 45 Days", days: 45, description: "Payment within 45 days of invoice" },
  { id: "pt5", name: "Net 60 Days", days: 60, description: "Payment within 60 days of invoice" },
];

const MOCK_DELIVERY_TERMS = [
  { id: "dt1", name: "FOR Destination", description: "Freight On Road to destination" },
  { id: "dt2", name: "Ex-Works", description: "Buyer arranges transport from factory" },
  { id: "dt3", name: "CIF", description: "Cost, Insurance, Freight included" },
  { id: "dt4", name: "FOB", description: "Free On Board at origin port" },
];

const MOCK_TAT = [
  { id: "tat1", processName: "Indent Creation to Approval", targetDays: 2, warningDays: 3 },
  { id: "tat2", processName: "Quotation Collection", targetDays: 5, warningDays: 7 },
  { id: "tat3", processName: "PO Creation to Approval", targetDays: 1, warningDays: 2 },
  { id: "tat4", processName: "PO to Delivery", targetDays: 14, warningDays: 21 },
  { id: "tat5", processName: "GRN to Payment", targetDays: 30, warningDays: 45 },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity") || "all";

  if (entity === "vendors") return NextResponse.json(MOCK_VENDORS);
  if (entity === "materials") return NextResponse.json(MOCK_MATERIALS);
  if (entity === "categories") return NextResponse.json(MOCK_CATEGORIES);
  if (entity === "units") return NextResponse.json(MOCK_UNITS);
  if (entity === "warehouses") return NextResponse.json(MOCK_WAREHOUSES);
  if (entity === "departments") return NextResponse.json(MOCK_DEPARTMENTS);
  if (entity === "employees") return NextResponse.json(MOCK_EMPLOYEES);
  if (entity === "tax") return NextResponse.json(MOCK_TAX);
  if (entity === "payment-terms") return NextResponse.json(MOCK_PAYMENT_TERMS);
  if (entity === "delivery-terms") return NextResponse.json(MOCK_DELIVERY_TERMS);
  if (entity === "tat") return NextResponse.json(MOCK_TAT);

  return NextResponse.json({
    vendors: MOCK_VENDORS,
    materials: MOCK_MATERIALS,
    categories: MOCK_CATEGORIES,
    units: MOCK_UNITS,
    warehouses: MOCK_WAREHOUSES,
    departments: MOCK_DEPARTMENTS,
    employees: MOCK_EMPLOYEES,
    tax: MOCK_TAX,
    paymentTerms: MOCK_PAYMENT_TERMS,
    deliveryTerms: MOCK_DELIVERY_TERMS,
    tat: MOCK_TAT,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { entity, data } = body;
  const id = `${entity}-${Date.now()}`;

  if (entity === "vendors") {
    const count = MOCK_VENDORS.length + 1;
    return NextResponse.json(
      {
        id,
        code: `VEN-${String(count).padStart(3, "0")}`,
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address || "Industrial Area",
        city: data.city || "Mumbai",
        state: data.state || "Maharashtra",
        gstNumber: data.gstNumber || "27AAACX0000X1Z5",
        pan: data.pan || "AAACX0000X",
        bankName: data.bankName || "HDFC Bank",
        accountNumber: data.accountNumber || "502000000001",
        ifsc: data.ifsc || "HDFC0000001",
        paymentTerms: data.paymentTerms || "Net 30 Days",
        creditDays: Number(data.creditDays) || 30,
        rating: Number(data.rating) || 4.0,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }

  if (entity === "materials") {
    const count = MOCK_MATERIALS.length + 1;
    const category = MOCK_CATEGORIES.find((c) => c.id === data.categoryId) || MOCK_CATEGORIES[0];
    const unit = MOCK_UNITS.find((u) => u.id === data.unitId) || MOCK_UNITS[0];
    return NextResponse.json(
      {
        id,
        code: `MAT-${String(count).padStart(3, "0")}`,
        name: data.name,
        description: data.description || null,
        categoryId: data.categoryId,
        category,
        unitId: data.unitId,
        unit,
        estimatedRate: Number(data.estimatedRate) || 100,
        gstRate: Number(data.gstRate) || 18,
        reorderLevel: Number(data.reorderLevel) || 100,
      },
      { status: 201 }
    );
  }

  return NextResponse.json({ error: "Unsupported entity" }, { status: 400 });
}
