"use client";

import React, { useEffect, useState } from "react";
import { RotateCcw, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function PurchaseReturnPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [reason, setReason] = useState("Damaged/Defective materials rejected during quality inspection.");
  const [returnAmount, setReturnAmount] = useState("15000");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [retRes, poRes] = await Promise.all([fetch("/api/returns"), fetch("/api/pos")]);
      const retData = await retRes.json();
      const poData = await poRes.json();

      setReturns(Array.isArray(retData) ? retData : []);
      // Eligible source POs: goods already received against them (fully or partially),
      // so items are physically in the warehouse and can be sent back to the vendor.
      const eligiblePOs = (Array.isArray(poData) ? poData : []).filter((p) => ["COMPLETED", "PARTIALLY_COMPLETED"].includes(p.status));
      setPos(eligiblePOs);
      if (eligiblePOs.length) setSelectedPoId(eligiblePOs[0].id);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReturnForPO = (po: any) => {
    setSelectedPoId(po.id);
    setIsAddOpen(true);
  };

  const handleCreateReturn = async () => {
    setIsSubmitting(true);
    const po = pos.find((p) => p.id === selectedPoId);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId: selectedPoId,
          vendorId: po?.vendorId,
          reason,
          totalReturnAmount: returnAmount,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setIsAddOpen(false);
        setSuccessNotice(`Return ${created.returnNo} raised successfully against ${po?.poNo || "PO"}! Moved to History.`);
        fetchData();
        setActiveTab("history");
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  // Pending Tab: Received POs eligible for a return (source list, like Receipt/Logistics)
  // History Tab: Purchase returns already raised against vendors
  const pendingPOs = pos;
  const historyReturns = returns;

  const pendingColumns = [
    {
      accessorKey: "poNo",
      header: "PO Number",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.poNo}</span>,
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => <span className="font-semibold">{row.original.vendor?.name || "Vendor"}</span>,
    },
    {
      accessorKey: "items",
      header: "Received Materials",
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
      accessorKey: "grandTotal",
      header: "Order Value",
      cell: ({ row }: any) => `₹${Number(row.original.grandTotal || 0).toLocaleString("en-IN")}`,
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
          onClick={() => openReturnForPO(row.original)}
          className="h-7 text-xs font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Raise Return
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      accessorKey: "returnNo",
      header: "Return No",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.returnNo}</span>,
    },
    {
      accessorKey: "returnDate",
      header: "Return Date",
      cell: ({ row }: any) => new Date(row.original.returnDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "po",
      header: "PO Reference",
      cell: ({ row }: any) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {row.original.po?.poNo || row.original.grn?.grnNo || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "vendor",
      header: "Vendor Name",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "totalReturnAmount",
      header: "Return Value",
      cell: ({ row }: any) => {
        const val = row.original.totalReturnAmount || (row.original.totalItems ? row.original.totalItems * 3100 : 0);
        return <span className="font-bold text-rose-600 dark:text-rose-400">₹{Number(val).toLocaleString("en-IN")}</span>;
      },
    },
    {
      accessorKey: "reason",
      header: "Return Reason",
      cell: ({ row }: any) => <span className="text-xs italic truncate max-w-xs block">{row.original.reason}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status || "APPROVED"} />,
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Return Workflow</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Initiate Debit Note / Purchase Returns for damaged or quality-failed items back to vendors.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Initiate Purchase Return
        </Button>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <span>{successNotice}</span>
          <button onClick={() => setSuccessNotice(null)} className="font-bold text-emerald-600 ml-4 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <WorkflowTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingPOs.length}
        historyCount={historyReturns.length}
      />

      {activeTab === "pending" ? (
        <DataTable
          columns={pendingColumns}
          data={pendingPOs}
          searchPlaceholder="Search received POs eligible for return (PO-2026-..., Vendor)..."
        />
      ) : (
        <DataTable
          columns={historyColumns}
          data={historyReturns}
          searchPlaceholder="Search purchase returns (RET-2026-..., Vendor Name)..."
        />
      )}

      {/* Create Purchase Return Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Initiate Purchase Return Requisition"
        subtitle="Create debit note return against a received PO."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <Select
            label="Select Received Purchase Order"
            value={selectedPoId}
            onChange={(e) => setSelectedPoId(e.target.value)}
            options={pos.map((p) => ({ label: `${p.poNo} - ${p.vendor?.name}`, value: p.id }))}
          />

          <Input
            label="Return Valuation Amount (₹)"
            type="number"
            value={returnAmount}
            onChange={(e) => setReturnAmount(e.target.value)}
          />

          <div className="space-y-1">
            <label className="font-bold uppercase text-slate-700 dark:text-slate-300">Return Reason Rationale</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateReturn} isLoading={isSubmitting} className="font-bold">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Submit Purchase Return
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
