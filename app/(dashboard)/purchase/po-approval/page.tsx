"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { useAuth } from "@/lib/auth/auth-context";

export default function POApprovalPage() {
  const { user } = useAuth();
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPo, setSelectedPo] = useState<any>(null);

  const [comments, setComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
          comments,
          userName: user?.name,
          userRole: user?.role,
          userEmail: user?.email,
        }),
      });

      if (res.ok) {
        setSelectedPo(null);
        setComments("");
        fetchPos();
      }
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const pendingApprovalPos = pos.filter((p) => p.status === "PENDING_APPROVAL");

  const columns = [
    {
      accessorKey: "poNo",
      header: "PO Number",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.poNo}</span>,
    },
    {
      accessorKey: "poDate",
      header: "PO Date",
      cell: ({ row }: any) => new Date(row.original.poDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "approvalLevel",
      header: "Approval Stage",
      cell: ({ row }: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          Level {row.original.approvalLevel} / 4
        </span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Grand Total",
      cell: ({ row }: any) => (
        <span className="font-bold">₹{Number(row.original.grandTotal || 0).toLocaleString("en-IN")}</span>
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
          onClick={() => setSelectedPo(row.original)}
          className="h-7 text-xs font-bold"
        >
          Review & Authorize
        </Button>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Multilevel PO Approval Desk</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          4-Level approval workflow (Level 1: Purchase Mgr -&gt; Level 2: Dept Head -&gt; Level 3: Finance -&gt; Level 4: Admin).
        </p>
      </div>

      <DataTable
        columns={columns}
        data={pendingApprovalPos}
        searchPlaceholder="Search pending PO approvals..."
      />

      {selectedPo && (
        <Modal
          isOpen={!!selectedPo}
          onClose={() => setSelectedPo(null)}
          title={`PO Authorization: ${selectedPo.poNo}`}
          subtitle={`Current Approval Level: Level ${selectedPo.approvalLevel} of 4`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase block">Vendor:</span>
                <span className="font-bold">{selectedPo.vendor?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block">Payment Terms:</span>
                <span className="font-bold">{selectedPo.paymentTerms}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block">Delivery Terms:</span>
                <span className="font-bold">{selectedPo.deliveryTerms}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block">Grand Total:</span>
                <span className="text-sm font-black text-blue-600">₹{selectedPo.grandTotal?.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Line items */}
            <div>
              <h5 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">PO Items:</h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-2">Material</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Rate</th>
                      <th className="p-2">GST %</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedPo.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="p-2 font-bold">{it.material?.name}</td>
                        <td className="p-2">{it.quantity} {it.unit?.symbol || "pcs"}</td>
                        <td className="p-2">₹{it.rate}</td>
                        <td className="p-2">{it.gstPercent}%</td>
                        <td className="p-2 text-right font-bold">₹{it.totalAmount?.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Approval History */}
            {selectedPo.approvals?.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">Previous Approval Logs:</h5>
                <div className="space-y-2 text-xs">
                  {selectedPo.approvals.map((app: any) => (
                    <div key={app.id} className="p-2 rounded bg-slate-50 dark:bg-slate-800 flex justify-between">
                      <div>
                        <strong>Level {app.level}: {app.actionBy} ({app.actionRole})</strong>
                        {app.comments && <p className="text-slate-500 italic">&quot;{app.comments}&quot;</p>}
                      </div>
                      <StatusBadge status={app.action} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="font-bold uppercase text-slate-700 dark:text-slate-300">Approval Comments</label>
              <textarea
                rows={2}
                placeholder="Enter remarks for PO clearance..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="danger" size="sm" onClick={() => handlePOAction("REJECT")} isLoading={isProcessing}>
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject PO
              </Button>
              <Button variant="primary" size="sm" onClick={() => handlePOAction("APPROVE")} isLoading={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Grant Approval Level {selectedPo.approvalLevel}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
