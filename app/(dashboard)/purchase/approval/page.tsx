"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { useAuth } from "@/lib/auth/auth-context";

export default function IndentApprovalPage() {
  const { user } = useAuth();
  const [indents, setIndents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndent, setSelectedIndent] = useState<any>(null);

  const [actionComments, setActionComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
          comments: actionComments,
          userName: user?.name,
          userRole: user?.role,
          userEmail: user?.email,
        }),
      });

      if (res.ok) {
        setSelectedIndent(null);
        setActionComments("");
        fetchIndents();
      }
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const pendingApprovalIndents = indents.filter((i) => ["SUBMITTED", "UNDER_REVIEW"].includes(i.status));

  const columns = [
    {
      accessorKey: "indentNo",
      header: "Indent No",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.indentNo}</span>,
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
      header: "Review & Action",
      cell: ({ row }: any) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => setSelectedIndent(row.original)}
          className="h-7 text-xs font-bold"
        >
          Review Requisition
        </Button>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Indent Approval Desk</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review department requisition items, verify budget allocations, and authorize procurement workflows.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={pendingApprovalIndents}
        searchPlaceholder="Search pending indents for approval..."
      />

      {/* Review Modal */}
      {selectedIndent && (
        <Modal
          isOpen={!!selectedIndent}
          onClose={() => setSelectedIndent(null)}
          title={`Indent Approval Review: ${selectedIndent.indentNo}`}
          subtitle="Review details, item breakdown, and record approval decision."
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Department:</span>
                <span className="text-xs font-bold">{selectedIndent.department?.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Requested By:</span>
                <span className="text-xs font-bold">{selectedIndent.requestedByName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Required Date:</span>
                <span className="text-xs font-bold">
                  {new Date(selectedIndent.requiredDate).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Total Estimated Cost:</span>
                <span className="text-sm font-black text-blue-600">
                  ₹{selectedIndent.totalEstimatedAmount?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Purpose:</h5>
              <p className="text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                {selectedIndent.purpose}
              </p>
            </div>

            {/* Requisitioned Items */}
            <div>
              <h5 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">Requisitioned Line Items:</h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-[10px] text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-2.5">Material</th>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5">Estimated Rate</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedIndent.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="p-2.5 font-bold">{it.material?.name}</td>
                        <td className="p-2.5">{it.quantity} {it.unit?.symbol || "pcs"}</td>
                        <td className="p-2.5">₹{it.estimatedRate}</td>
                        <td className="p-2.5 text-right font-bold">₹{it.estimatedAmount?.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Approval History */}
            {selectedIndent.approvals?.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">Approval History Trail:</h5>
                <div className="space-y-2">
                  {selectedIndent.approvals.map((app: any) => (
                    <div key={app.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-start justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{app.actionBy} ({app.actionRole})</div>
                        {app.comments && <div className="text-slate-500 italic mt-0.5">&quot;{app.comments}&quot;</div>}
                      </div>
                      <StatusBadge status={app.action} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Comments Input */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Approver Comments / Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Enter approval rationale or reasons for sending back..."
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProcessAction("SEND_BACK")}
                isLoading={isProcessing}
                className="text-amber-600 border-amber-300 dark:border-amber-800 hover:bg-amber-50"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Send Back to Draft
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleProcessAction("REJECT")}
                isLoading={isProcessing}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Indent
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleProcessAction("APPROVE")}
                isLoading={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Requisition
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
