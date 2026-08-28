import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit-notification";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendor: true,
        po: true,
        transactions: true,
      },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, amount, paymentMethod, transactionRef, remarks, userName, userEmail, userRole } = body;

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const payAmount = Number(amount);
    const newPaidAmount = payment.paidAmount + payAmount;
    const newBalanceAmount = payment.invoiceAmount - newPaidAmount;

    let newStatus = payment.status;
    if (newBalanceAmount <= 0) {
      newStatus = "PAID";
    } else if (newPaidAmount > 0) {
      newStatus = "PARTIALLY_PAID";
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: Math.max(0, newBalanceAmount),
        status: newStatus,
        transactions: {
          create: {
            amount: payAmount,
            paymentMethod: paymentMethod || "NEFT",
            transactionRef: transactionRef || `NEFT-${Date.now()}`,
            remarks: remarks || "Payment transaction processed",
            createdByName: userName || "Sunita Deshmukh",
          },
        },
      },
      include: { vendor: true, po: true, transactions: true },
    });

    await createAuditLog({
      userEmail: userEmail || "accounts@purchaseflow.com",
      userName: userName || "Sunita Deshmukh",
      userRole: userRole || "ACCOUNTS",
      action: "Processed Payment Transaction",
      entity: "Payment",
      entityId: payment.paymentNo,
      previousStatus: payment.status,
      newStatus: newStatus,
      details: `Paid ₹${payAmount.toLocaleString("en-IN")} via ${paymentMethod || "NEFT"}. Remaining balance: ₹${Math.max(0, newBalanceAmount).toLocaleString("en-IN")}`,
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    return NextResponse.json({ error: "Failed to record payment transaction" }, { status: 500 });
  }
}
