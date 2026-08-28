import { NextResponse } from "next/server";
import { MOCK_PAYMENTS, MOCK_VENDORS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_PAYMENTS);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { paymentId, amount, paymentMethod, transactionRef, remarks } = body;

  const payment = MOCK_PAYMENTS.find((p) => p.id === paymentId);
  if (!payment) {
    return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
  }

  const payAmount = Number(amount);
  const newPaidAmount = payment.paidAmount + payAmount;
  const newBalanceAmount = payment.invoiceAmount - newPaidAmount;
  let newStatus = payment.status;
  if (newBalanceAmount <= 0) newStatus = "PAID";
  else if (newPaidAmount > 0) newStatus = "PARTIALLY_PAID";

  const updatedPayment = {
    ...payment,
    paidAmount: newPaidAmount,
    balanceAmount: Math.max(0, newBalanceAmount),
    status: newStatus,
    transactions: [
      ...payment.transactions,
      {
        id: `tr-${Date.now()}`,
        amount: payAmount,
        paymentMethod: paymentMethod || "NEFT",
        transactionRef: transactionRef || `NEFT-${Date.now()}`,
        remarks: remarks || "Payment transaction processed",
        createdByName: body.userName || "Sunita Deshmukh",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  return NextResponse.json(updatedPayment);
}
