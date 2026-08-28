"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, DollarSign, Eye, History, Plus, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import Link from "next/link";

export default function PaymentHubPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [viewHistoryPayment, setViewHistoryPayment] = useState<any>(null);

  // Form State
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("NEFT");
  const [transactionRef, setTransactionRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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

  const openPaymentModal = (pay: any) => {
    setSelectedPayment(pay);
    setPayAmount(String(pay.balanceAmount || pay.invoiceAmount || 0));
    setTransactionRef(`NEFT-${Date.now().toString().slice(-6)}`);
  };

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
        const updated = await res.json();
        setSelectedPayment(null);
        setPayAmount("");
        setSuccessNotice(`Payment of ₹${Number(payAmount).toLocaleString("en-IN")} processed for ${updated.paymentNo}! Balance remaining: ₹${Number(updated.balanceAmount).toLocaleString("en-IN")}`);
        fetchPayments();
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const pendingPayments = payments.filter((p) => ["PENDING", "PARTIALLY_PAID", "OVERDUE"].includes(p.status));
  const historyPayments = payments.filter((p) => p.status === "PAID");
  const activeData = activeTab === "pending" ? pendingPayments : historyPayments;

  const columns = [
    {
      accessorKey: "paymentNo",
      header: "Payment ID",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.paymentNo}</span>,
    },
    {
      accessorKey: "po",
      header: "PO Reference",
      cell: ({ row }: any) => row.original.po?.poNo || "PO-2026",
    },
    {
      accessorKey: "vendor",
      header: "Supplier / Vendor",
      cell: ({ row }: any) => <span className="font-semibold">{row.original.vendor?.name || "Vendor"}</span>,
    },
    {
      accessorKey: "invoiceNo",
      header: "Invoice Reference",
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.original.invoiceNo}</div>
          <div className="text-[10px] text-slate-500">
            Due: {new Date(row.original.dueDate || row.original.createdAt).toLocaleDateString("en-IN")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "invoiceAmount",
      header: "Invoice Total",
      cell: ({ row }: any) => `₹${Number(row.original.invoiceAmount || 0).toLocaleString("en-IN")}`,
    },
    {
      accessorKey: "paidAmount",
      header: "Paid So Far",
      cell: ({ row }: any) => (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          ₹{Number(row.original.paidAmount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "balanceAmount",
      header: "Balance Due",
      cell: ({ row }: any) => (
        <span className="font-bold text-rose-600 dark:text-rose-400">
          ₹{Number(row.original.balanceAmount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Payment Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5">
          {activeTab === "pending" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => openPaymentModal(row.original)}
              className="h-7 text-xs font-bold"
            >
              <DollarSign className="w-3.5 h-3.5 mr-1" /> Process Payment
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewHistoryPayment(row.original)}
              className="h-7 text-xs"
            >
              <History className="w-3.5 h-3.5 mr-1" /> View Transactions
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supplier Payments & Accounts Desk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reconcile verified GRN material invoices, execute advance/milestone remittances, and maintain 3-way matching audit logs.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="text-xs font-bold">
            Dashboard Overview <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Success Banner */}
      {successNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <span>{successNotice}</span>
          <button onClick={() => setSuccessNotice(null)} className="font-bold text-emerald-600 ml-4 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Workflow Tabs */}
      <WorkflowTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingPayments.length}
        historyCount={historyPayments.length}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={activeData}
        searchPlaceholder="Search invoices & payments (PAY-2026-..., Vendor, PO)..."
      />

      {/* Process Payment Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Process Supplier Remittance: ${selectedPayment.paymentNo}`}
          subtitle={`Supplier: ${selectedPayment.vendor?.name} | Balance Due: ₹${Number(selectedPayment.balanceAmount || 0).toLocaleString("en-IN")}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Bank:</span>
                <span className="font-bold">{selectedPayment.vendor?.bankName || "HDFC Bank"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">A/C Number:</span>
                <span className="font-mono">{selectedPayment.vendor?.accountNumber || "50200012345"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">IFSC Code:</span>
                <span className="font-mono">{selectedPayment.vendor?.ifsc || "HDFC0000123"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Invoice Total:</span>
                <span className="font-bold text-blue-600">₹{Number(selectedPayment.invoiceAmount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Payment Amount to Disburse (₹)"
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
              <Select
                label="Banking Payment Channel"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { label: "NEFT (National Electronic Fund Transfer)", value: "NEFT" },
                  { label: "RTGS (Real Time Gross Settlement)", value: "RTGS" },
                  { label: "IMPS Immediate Banking", value: "IMPS" },
                  { label: "Corporate Account Cheque", value: "CHEQUE" },
                  { label: "UPI Corporate VPA", value: "UPI" },
                ]}
              />
            </div>

            <Input
              label="Bank UTR / Transaction Reference Number"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />

            <Input
              label="Remittance Remarks / Accounting Notes"
              placeholder="e.g. Cleared 50% milestone payment against verified GRN"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleMakePayment} isLoading={isSubmitting} className="font-bold">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Authorize & Post Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Payment History Transactions Modal */}
      {viewHistoryPayment && (
        <Modal
          isOpen={!!viewHistoryPayment}
          onClose={() => setViewHistoryPayment(null)}
          title={`Remittance History: ${viewHistoryPayment.paymentNo}`}
          subtitle={`Supplier: ${viewHistoryPayment.vendor?.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block">Total Invoice Settled:</span>
                <span className="text-xs text-slate-500">Invoice: {viewHistoryPayment.invoiceNo}</span>
              </div>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                ₹{Number(viewHistoryPayment.invoiceAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div>
              <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Transaction Audit Log:</h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Channel</th>
                      <th className="p-2">UTR Ref</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {viewHistoryPayment.transactions?.map((t: any) => (
                      <tr key={t.id}>
                        <td className="p-2">{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="p-2 font-medium">{t.paymentMethod}</td>
                        <td className="p-2 font-mono">{t.transactionRef}</td>
                        <td className="p-2 text-right font-bold text-emerald-600">₹{Number(t.amount || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setViewHistoryPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
