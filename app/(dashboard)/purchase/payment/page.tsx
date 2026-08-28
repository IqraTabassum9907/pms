"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, DollarSign, Eye, History, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function PaymentHubPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Form State
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("NEFT");
  const [transactionRef, setTransactionRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleMakePayment = async () => {
    if (!selectedPayment) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          amount: payAmount,
          paymentMethod,
          transactionRef: transactionRef || `NEFT-${Date.now()}`,
          remarks,
        }),
      });

      if (res.ok) {
        setSelectedPayment(null);
        setPayAmount("");
        fetchPayments();
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const columns = [
    {
      accessorKey: "paymentNo",
      header: "Payment ID",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.paymentNo}</span>,
    },
    {
      accessorKey: "po",
      header: "PO Number",
      cell: ({ row }: any) => row.original.po?.poNo || "N/A",
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "invoiceNo",
      header: "Invoice No / Date",
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.original.invoiceNo}</div>
          <div className="text-[10px] text-slate-500">
            {new Date(row.original.invoiceDate).toLocaleDateString("en-IN")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "invoiceAmount",
      header: "Invoice Amt",
      cell: ({ row }: any) => `₹${Number(row.original.invoiceAmount || 0).toLocaleString("en-IN")}`,
    },
    {
      accessorKey: "paidAmount",
      header: "Paid Amt",
      cell: ({ row }: any) => (
        <span className="text-emerald-600 font-bold">
          ₹{Number(row.original.paidAmount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "balanceAmount",
      header: "Balance Due",
      cell: ({ row }: any) => (
        <span className="text-rose-600 font-bold">
          ₹{Number(row.original.balanceAmount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }: any) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelectedPayment(row.original);
            setPayAmount(String(row.original.balanceAmount));
          }}
          disabled={row.original.status === "PAID"}
          className="h-7 text-xs font-bold"
        >
          <CreditCard className="w-3.5 h-3.5 mr-1" /> Record Payment
        </Button>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Hub & Financial Ledger</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage accounts payable, process full/partial vendor payments, and track remaining balance dues.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search Payments (PAY-2026-..., Vendor Name, Invoice No)..."
        filterOptions={[
          { label: "Pending", value: "PENDING", key: "status" },
          { label: "Partially Paid", value: "PARTIALLY_PAID", key: "status" },
          { label: "Paid", value: "PAID", key: "status" },
          { label: "Overdue", value: "OVERDUE", key: "status" },
        ]}
      />

      {/* Record Payment Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Process Vendor Payment: ${selectedPayment.paymentNo}`}
          subtitle={`Vendor: ${selectedPayment.vendor?.name} (Invoice #${selectedPayment.invoiceNo})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span>Invoice Total:</span>
                <strong className="text-slate-900 dark:text-slate-100">₹{selectedPayment.invoiceAmount?.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Already Paid:</span>
                <strong>₹{selectedPayment.paidAmount?.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between text-rose-600 font-bold border-t border-slate-200 dark:border-slate-700 pt-1">
                <span>Remaining Balance Due:</span>
                <span>₹{selectedPayment.balanceAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Input
              label="Payment Transaction Amount (₹)"
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />

            <Select
              label="Payment Transfer Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { label: "NEFT Bank Transfer", value: "NEFT" },
                { label: "RTGS Transfer", value: "RTGS" },
                { label: "Direct Bank Transfer", value: "BANK_TRANSFER" },
                { label: "Corporate Cheque", value: "CHEQUE" },
                { label: "UPI Business Transfer", value: "UPI" },
              ]}
            />

            <Input
              label="Bank Reference / UTR Number"
              placeholder="e.g. HDFCNEFT98765432"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />

            <Input
              label="Remarks / Voucher Note"
              placeholder="e.g. Cleared 100% full payment invoice voucher #88"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            {/* Payment Transactions History */}
            {selectedPayment.transactions?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Previous Transaction History:</h5>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedPayment.transactions.map((tx: any) => (
                    <div key={tx.id} className="p-2 bg-slate-100 dark:bg-slate-900 rounded flex justify-between">
                      <div>
                        <strong>₹{tx.amount?.toLocaleString("en-IN")}</strong> via {tx.paymentMethod} ({tx.transactionRef})
                      </div>
                      <span className="text-slate-400">{new Date(tx.paymentDate).toLocaleDateString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleMakePayment} isLoading={isSubmitting} className="font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Post Payment Transaction
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
