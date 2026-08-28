import { NextResponse } from "next/server";
import { MOCK_PAYMENTS, MOCK_DASHBOARD, MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(MOCK_PAYMENTS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, amount, paymentMethod, transactionRef, remarks } = body;

    const paymentIndex = MOCK_PAYMENTS.findIndex((p) => p.id === paymentId || p.paymentNo === paymentId);
    const payment = paymentIndex !== -1 ? MOCK_PAYMENTS[paymentIndex] : MOCK_PAYMENTS[0];

    const payAmount = Number(amount);
    const newPaidAmount = payment.paidAmount + payAmount;
    const newBalanceAmount = payment.invoiceAmount - newPaidAmount;
    let newStatus = payment.status;
    if (newBalanceAmount <= 0) newStatus = "PAID";
    else if (newPaidAmount > 0) newStatus = "PARTIALLY_PAID";

    const newTxn = {
      id: `tr-${Date.now()}`,
      amount: payAmount,
      paymentMethod: paymentMethod || "NEFT",
      transactionRef: transactionRef || `NEFT-${Date.now()}`,
      remarks: remarks || "Payment transaction processed",
      createdByName: body.userName || "Sunita Deshmukh",
      createdAt: new Date().toISOString(),
    };

    const updatedPayment = {
      ...payment,
      paidAmount: newPaidAmount,
      balanceAmount: Math.max(0, newBalanceAmount),
      status: newStatus,
      transactions: [...payment.transactions, newTxn],
    };

    // Save in memory
    if (paymentIndex !== -1) {
      MOCK_PAYMENTS[paymentIndex] = updatedPayment;
    }

    if (MOCK_DASHBOARD.kpis.pendingPayments >= payAmount) {
      MOCK_DASHBOARD.kpis.pendingPayments -= payAmount;
    }

    MOCK_AUDIT_LOGS.unshift({
      id: `al-${Date.now()}`,
      userEmail: body.userEmail || "accounts@purchaseflow.com",
      userName: body.userName || "Sunita Deshmukh",
      userRole: body.userRole || "ACCOUNTS",
      action: "Processed Payment Transaction",
      entity: "Payment",
      entityId: payment.paymentNo,
      previousStatus: payment.status,
      newStatus,
      details: `Paid ₹${payAmount.toLocaleString("en-IN")} via ${paymentMethod || "NEFT"}. Balance: ₹${Math.max(0, newBalanceAmount).toLocaleString("en-IN")}`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    MOCK_NOTIFICATIONS.unshift({
      id: `n-${Date.now()}`,
      title: `Payment Processed: ${payment.paymentNo}`,
      message: `₹${payAmount.toLocaleString("en-IN")} paid to ${payment.vendor?.name}.`,
      type: "SUCCESS",
      recipientRole: "ACCOUNTS",
      isRead: false,
      linkUrl: "/purchase/payment",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Failed to record payment transaction" }, { status: 500 });
  }
}
