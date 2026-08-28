import { NextResponse } from "next/server";
import { MOCK_QUOTATIONS, MOCK_VENDORS } from "@/lib/mock-data";

export async function POST(req: Request) {
  const body = await req.json();
  const { quotationId, indentId } = body;

  const quotation = MOCK_QUOTATIONS.find((q) => q.id === quotationId);
  if (!quotation) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  // Mock: mark selected quotation as SELECTED
  const updatedQuotation = { ...quotation, status: "SELECTED" };

  return NextResponse.json({ success: true, quotation: updatedQuotation });
}
