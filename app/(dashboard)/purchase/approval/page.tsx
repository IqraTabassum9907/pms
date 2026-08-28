"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Eye, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";

export default function IndentApprovalPage() {
  const { user } = useAuth();
  const [indents, setIndents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [selectedIndent, setSelectedIndent] = useState<any>(null);

  const [actionComments, setActionComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchIndents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/indents");
      const data = await res.json();
      setIndents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIndents();
  }, []);

  const handleProcessAction = async (action: "APPROVE" | "REJECT" | "SEND_BACK") => {
    if (!selectedIndent) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/indents/${selectedIndent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          comments: actionComments || (action === "APPROVE" ? "Approved by Department Head." : "Rejected during review."),
          userName: user?.name || "Rajesh Sharma",
          userRole: user?.role || "DEPARTMENT_HEAD",
          userEmail: user?.email || "depthead@purchaseflow.com",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedIndent(null);
        setActionComments("");
        setSuccessNotice(
          action === "APPROVE"
            ? `Indent ${updated.indentNo} approved successfully! Moved to History & advanced to Quotation stage.`
            : `Indent ${updated.indentNo} marked as ${action}.`
        );
        fetchIndents();
      }
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const pendingIndents = indents.filter((i) => ["SUBMITTED", "UNDER_REVIEW"].includes(i.status));
  const historyIndents = indents.filter((i) => ["APPROVED", "REJECTED", "CANCELLED", "DRAFT"].includes(i.status));
  const activeData = activeTab === "pending" ? pendingIndents : historyIndents;

  const columns = [
    {
      accessorKey: "indentNo",
      header: "Indent No",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.indentNo}</span>,
    },
    {
      accessorKey: "indentDate",
      header: "Date",
      cell: ({ row }: any) => new Date(row.original.indentDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }: any) => row.original.department?.name || "N/A",
    },
    {
      accessorKey: "requestedByName",
      header: "Requested By",
    },
    {
      accessorKey: "items",
      header: "Material / Qty",
      cell: ({ row }: any) => {
        const it = row.original.items?.[0];
        if (!it) return "N/A";
        return (
          <span className="text-xs">
            <strong className="text-slate-900 dark:text-slate-100">{it.material?.name || "Item"}</strong> ({it.quantity} {it.unit?.symbol || "pcs"})
            {row.original.items.length > 1 && <span className="text-blue-500 font-bold ml-1">+{row.original.items.length - 1} more</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: any) => <StatusBadge status={row.original.priority} />,
    },
    {
      accessorKey: "totalEstimatedAmount",
      header: "Est. Cost",
      cell: ({ row }: any) => (
        <span className="font-bold">₹{Number(row.original.totalEstimatedAmount || 0).toLocaleString("en-IN")}</span>
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
            onClick={() => setSelectedIndent(row.original)}
            className="h-7 text-xs font-bold"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Review & Action
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedIndent(row.original)}
            className="h-7 text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> View Details
          </Button>
        )
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Indent Approval Desk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review department requisition items, verify budget allocations, and authorize procurement workflows.
          </p>
        </div>
        <Link href="/purchase/quotation">
          <Button variant="outline" className="text-xs">
            Go to Quotations <ArrowRight className="w-4 h-4 ml-1" />
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
        pendingCount={pendingIndents.length}
        historyCount={historyIndents.length}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={activeData}
        searchPlaceholder="Search indents for approval (IND-2026-..., Department)..."
      />

      {/* Review Modal Form */}
      {selectedIndent && (
        <Modal
          isOpen={!!selectedIndent}
          onClose={() => setSelectedIndent(null)}
          title={`Indent Approval Review: ${selectedIndent.indentNo}`}
          subtitle="Fill approval comments and authorize or reject this requisition."
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Department:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedIndent.department?.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Requested By:</span>
                <span className="font-bold">{selectedIndent.requestedByName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Priority:</span>
                <StatusBadge status={selectedIndent.priority} />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Current Status:</span>
                <StatusBadge status={selectedIndent.status} />
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Requisition Purpose:</h5>
              <p className="p-3 text-xs bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {selectedIndent.purpose || "General Operational Procurement Requirement"}
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">Material Line Items & Estimates:</h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Material Description</th>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5">Est. Rate</th>
                      <th className="p-2.5 text-right">Est. Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedIndent.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="p-2.5 font-medium">{it.material?.name || "Material"}</td>
                        <td className="p-2.5">{it.quantity} {it.unit?.symbol || "pcs"}</td>
                        <td className="p-2.5">₹{Number(it.estimatedRate || 0).toLocaleString("en-IN")}</td>
                        <td className="p-2.5 text-right font-bold">₹{Number(it.estimatedAmount || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900 font-bold text-xs">
              <span className="text-blue-950 dark:text-blue-200">Total Estimated Budget:</span>
              <span className="text-blue-600 dark:text-blue-400 text-sm">₹{Number(selectedIndent.totalEstimatedAmount || 0).toLocaleString("en-IN")}</span>
            </div>

            {/* Approver Decision Form */}
            {activeTab === "pending" ? (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold block text-slate-700 dark:text-slate-300">
                  Approver Remarks / Instructions:
                </label>
                <textarea
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="e.g. Approved for procurement. Proceed with RFQ and vendor quotation collection."
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                />

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedIndent(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleProcessAction("REJECT")}
                    isLoading={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject Indent
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleProcessAction("SEND_BACK")}
                    isLoading={isProcessing}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" /> Send Back for Revision
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleProcessAction("APPROVE")}
                    isLoading={isProcessing}
                    className="font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Advance to RFQ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setSelectedIndent(null)}>
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
