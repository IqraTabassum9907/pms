import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const stock = await prisma.inventory.findMany({
      include: {
        material: { include: { category: true } },
        warehouse: true,
        unit: true,
      },
    });

    const movements = await prisma.stockMovement.findMany({
      orderBy: { movementDate: "desc" },
      take: 25,
      include: { warehouse: true },
    });

    return NextResponse.json({ stock, movements });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stock inventory" }, { status: 500 });
  }
}
