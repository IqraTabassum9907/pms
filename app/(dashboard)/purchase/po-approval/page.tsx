"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, ShieldCheck, Eye, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";

export default function POApprovalPage() {
  const { user } = useAuth();
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [selectedPo, setSelectedPo] = useState<any>(null);

  const [comments, setComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchPos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pos");
      const data = await res.json();
      setPos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPos();
  }, []);

  const handlePOAction = async (action: "APPROVE" | "REJECT") => {
    if (!selectedPo) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/pos/${selectedPo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          comments: comments || (action === "APPROVE" ? "Approved by Purchase Manager." : "Rejected during approval review."),
          userName: user?.name || "Kavita Singh",
          userRole: user?.role || "PURCHASE_MANAGER",
          userEmail: user?.email || "manager@purchaseflow.com",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedPo(null);
        setComments("");
        setSuccessNotice(
          action === "APPROVE"
            ? `Purchase Order ${updated.poNo} approved successfully! Moved to History & advanced to PO Dispatch desk.`
            : `Purchase Order ${updated.poNo} rejected.`
        );
        fetchPos();
      }
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const pendingPos = pos.filter((p) => p.status === "PENDING_APPROVAL");
  const historyPos = pos.filter((p) => ["APPROVED", "SENT", "IN_PROGRESS", "PARTIALLY_COMPLETED", "COMPLETED", "REJECTED", "CANCELLED"].includes(p.status));
  const activeData = activeTab === "pending" ? pendingPos : historyPos;

  const columns = [
    {
      accessorKey: "poNo",
      header: "PO Number",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.poNo}</span>,
    },
    {
      accessorKey: "poDate",
      header: "PO Date",
      cell: ({ row }: any) => new Date(row.original.poDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "vendor",
      header: "Supplier / Vendor",
      cell: ({ row }: any) => <span className="font-semibold">{row.original.vendor?.name || "Vendor"}</span>,
    },
    {
      accessorKey: "approvalLevel",
      header: "Approval Level",
      cell: ({ row }: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Level {row.original.approvalLevel || 1} / 4
        </span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Grand Total",
      cell: ({ row }: any) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          ₹{Number(row.original.grandTotal || 0).toLocaleString("en-IN")}
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
        activeTab === "pending" ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setSelectedPo(row.original)}
            className="h-7 text-xs font-bold"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Review & Approve
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPo(row.original)}
              className="h-7 text-xs"
            >
              <Eye className="w-3.5 h-3.5 mr-1" /> View PO
            </Button>
            {row.original.status === "APPROVED" && (
              <Link href="/purchase/po-dispatch">
                <Button variant="secondary" size="sm" className="h-7 text-xs font-bold">
                  <Send className="w-3.5 h-3.5 mr-1" /> Dispatch
                </Button>
              </Link>
            )}
          </div>
        )
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Order Approval Desk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorize commercial purchase commitments, verify budget allocations, and trigger vendor dispatch workflows.
          </p>
        </div>
        <Link href="/purchase/po-dispatch">
          <Button variant="outline" className="text-xs">
            Go to PO Dispatch <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Success Notification Banner */}
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
        pendingCount={pendingPos.length}
        historyCount={historyPos.length}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={activeData}
        searchPlaceholder="Search POs for approval (PO-2026-..., Vendor)..."
      />

      {/* Review Modal Form */}
      {selectedPo && (
        <Modal
          isOpen={!!selectedPo}
          onClose={() => setSelectedPo(null)}
          title={`PO Approval Review: ${selectedPo.poNo}`}
          subtitle={`Supplier: ${selectedPo.vendor?.name} | Value: ₹${Number(selectedPo.grandTotal || 0).toLocaleString("en-IN")}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Supplier:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedPo.vendor?.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Payment Terms:</span>
                <span className="font-bold">{selectedPo.paymentTerms}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Delivery Terms:</span>
                <span className="font-bold">{selectedPo.deliveryTerms}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Status:</span>
                <StatusBadge status={selectedPo.status} />
              </div>
            </div>

            <div>
              <h5 className="font-bold uppercase text-[11px] text-slate-700 dark:text-slate-300 mb-2">Contract Item Lines:</h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <tr>
                      <th className="p-2.5">Material</th>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5">Rate</th>
                      <th className="p-2.5">GST</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedPo.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="p-2.5 font-medium">{it.material?.name}</td>
                        <td className="p-2.5">{it.quantity} {it.unit?.symbol || "pcs"}</td>
                        <td className="p-2.5">₹{Number(it.rate || 0).toLocaleString("en-IN")}</td>
                        <td className="p-2.5">{it.gstPercent || 18}%</td>
                        <td className="p-2.5 text-right font-bold">₹{Number(it.totalAmount || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900 font-bold">
              <span>Grand Total Amount:</span>
              <span className="text-blue-600 dark:text-blue-400 text-sm">₹{Number(selectedPo.grandTotal || 0).toLocaleString("en-IN")}</span>
            </div>

            {/* Approval Actions */}
            {activeTab === "pending" ? (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="font-bold block text-slate-700 dark:text-slate-300">
                  Manager Approval Remarks:
                </label>
                <textarea
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="e.g. Budget authorized. Proceed with dispatch to vendor."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPo(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handlePOAction("REJECT")}
                    isLoading={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject PO
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePOAction("APPROVE")}
                    isLoading={isProcessing}
                    className="font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve PO & Advance to Dispatch
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setSelectedPo(null)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
