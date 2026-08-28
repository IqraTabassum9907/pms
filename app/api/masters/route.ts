import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity") || "all";

  try {
    if (entity === "vendors") {
      const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(vendors);
    }
    if (entity === "materials") {
      const materials = await prisma.material.findMany({
        orderBy: { name: "asc" },
        include: { category: true, unit: true },
      });
      return NextResponse.json(materials);
    }
    if (entity === "categories") {
      const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(categories);
    }
    if (entity === "units") {
      const units = await prisma.unit.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(units);
    }
    if (entity === "warehouses") {
      const warehouses = await prisma.warehouse.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(warehouses);
    }
    if (entity === "departments") {
      const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(departments);
    }
    if (entity === "employees") {
      const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(employees);
    }
    if (entity === "tax") {
      const tax = await prisma.taxGST.findMany();
      return NextResponse.json(tax);
    }
    if (entity === "payment-terms") {
      const paymentTerms = await prisma.paymentTerm.findMany();
      return NextResponse.json(paymentTerms);
    }
    if (entity === "delivery-terms") {
      const deliveryTerms = await prisma.deliveryTerm.findMany();
      return NextResponse.json(deliveryTerms);
    }
    if (entity === "tat") {
      const tat = await prisma.tATConfiguration.findMany();
      return NextResponse.json(tat);
    }

    // Default fetch all core master collections
    const [vendors, materials, categories, units, warehouses, departments, employees, tax, paymentTerms, deliveryTerms, tat] =
      await Promise.all([
        prisma.vendor.findMany({ orderBy: { name: "asc" } }),
        prisma.material.findMany({ orderBy: { name: "asc" }, include: { category: true, unit: true } }),
        prisma.category.findMany({ orderBy: { name: "asc" } }),
        prisma.unit.findMany({ orderBy: { name: "asc" } }),
        prisma.warehouse.findMany({ orderBy: { name: "asc" } }),
        prisma.department.findMany({ orderBy: { name: "asc" } }),
        prisma.employee.findMany({ orderBy: { name: "asc" } }),
        prisma.taxGST.findMany(),
        prisma.paymentTerm.findMany(),
        prisma.deliveryTerm.findMany(),
        prisma.tATConfiguration.findMany(),
      ]);

    return NextResponse.json({
      vendors,
      materials,
      categories,
      units,
      warehouses,
      departments,
      employees,
      tax,
      paymentTerms,
      deliveryTerms,
      tat,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch master data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { entity, data } = body;

    if (entity === "vendors") {
      const count = await prisma.vendor.count();
      const code = `VEN-${String(count + 1).padStart(3, "0")}`;
      const vendor = await prisma.vendor.create({
        data: {
          code,
          name: data.name,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone,
          address: data.address || "Industrial Area",
          city: data.city || "Mumbai",
          state: data.state || "Maharashtra",
          gstNumber: data.gstNumber || "27AAACB1234A1Z5",
          pan: data.pan || "AAACB1234A",
          bankName: data.bankName || "HDFC Bank",
          accountNumber: data.accountNumber || "502000000000",
          ifsc: data.ifsc || "HDFC0000123",
          paymentTerms: data.paymentTerms || "Net 30 Days",
          creditDays: Number(data.creditDays) || 30,
          rating: Number(data.rating) || 4.5,
          status: "ACTIVE",
        },
      });
      return NextResponse.json(vendor, { status: 201 });
    }

    if (entity === "materials") {
      const count = await prisma.material.count();
      const code = `MAT-${String(count + 1).padStart(3, "0")}`;
      const material = await prisma.material.create({
        data: {
          code,
          name: data.name,
          description: data.description || null,
          categoryId: data.categoryId,
          unitId: data.unitId,
          estimatedRate: Number(data.estimatedRate) || 100,
          gstRate: Number(data.gstRate) || 18,
          reorderLevel: Number(data.reorderLevel) || 100,
        },
      });
      return NextResponse.json(material, { status: 201 });
    }

    return NextResponse.json({ error: "Unsupported entity" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create master record" }, { status: 500 });
  }
}
