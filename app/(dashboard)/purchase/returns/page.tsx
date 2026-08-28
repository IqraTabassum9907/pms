"use client";

import React, { useEffect, useState } from "react";
import { RotateCcw, Plus, CheckCircle2, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function PurchaseReturnPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [reason, setReason] = useState("Damaged/Defective materials rejected during quality inspection.");
  const [returnAmount, setReturnAmount] = useState("15000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [retRes, poRes] = await Promise.all([fetch("/api/returns"), fetch("/api/pos")]);
      const retData = await retRes.json();
      const poData = await poRes.json();

      setReturns(Array.isArray(retData) ? retData : []);
      const completedPOs = (Array.isArray(poData) ? poData : []).filter((p) => ["COMPLETED", "IN_PROGRESS", "PARTIALLY_COMPLETED"].includes(p.status));
      setPos(completedPOs);
      if (completedPOs.length) setSelectedPoId(completedPOs[0].id);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        setIsAddOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const columns = [
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
      cell: ({ row }: any) => row.original.po?.poNo || "N/A",
    },
    {
      accessorKey: "vendor",
      header: "Vendor Name",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "totalReturnAmount",
      header: "Return Value",
      cell: ({ row }: any) => (
        <span className="font-bold text-rose-600">₹{Number(row.original.totalReturnAmount || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      accessorKey: "reason",
      header: "Return Reason",
      cell: ({ row }: any) => <span className="text-xs italic truncate max-w-xs">{row.original.reason}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
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

      <DataTable
        columns={columns}
        data={returns}
        searchPlaceholder="Search purchase returns (RET-2026-..., Vendor Name)..."
      />

      {/* Create Purchase Return Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Initiate Purchase Return Requisition"
        subtitle="Create debit note return against delivered PO."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <Select
            label="Select Delivered Purchase Order"
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
              Submit Purchase Return
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
