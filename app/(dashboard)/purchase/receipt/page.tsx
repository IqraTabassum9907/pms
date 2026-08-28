"use client";

import React, { useEffect, useState } from "react";
import { PackageCheck, Plus, Eye, CheckCircle2, ShieldCheck, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function MaterialReceiptPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("MH-12 AB 4589");
  const [invoiceNo, setInvoiceNo] = useState("INV-2026-0988");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line items
  const [items, setItems] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, poRes, masterRes] = await Promise.all([
        fetch("/api/receipts"),
        fetch("/api/pos"),
        fetch("/api/masters"),
      ]);
      const recData = await recRes.json();
      const poData = await poRes.json();
      const masterData = await masterRes.json();

      setReceipts(Array.isArray(recData) ? recData : []);
      const activePOs = (Array.isArray(poData) ? poData : []).filter((p) => ["APPROVED", "SENT", "IN_PROGRESS", "PARTIALLY_COMPLETED"].includes(p.status));
      setPos(activePOs);
      setWarehouses(masterData.warehouses || []);

      if (masterData.warehouses?.length) setWarehouseId(masterData.warehouses[0].id);
      if (activePOs.length) {
        setSelectedPoId(activePOs[0].id);
        setupPoItems(activePOs[0]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setupPoItems = (po: any) => {
    if (po && po.items) {
      setItems(
        po.items.map((it: any) => ({
          materialId: it.materialId,
          materialName: it.material?.name || "Item",
          orderedQty: it.quantity,
          receivedQty: it.quantity,
          rejectedQty: 0,
          damagedQty: 0,
          batchNo: `BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        }))
      );
    }
  };

  const handlePoChange = (poId: string) => {
    setSelectedPoId(poId);
    const po = pos.find((p) => p.id === poId);
    if (po) setupPoItems(po);
  };

  const handleCreateGRN = async () => {
    setIsSubmitting(true);
    const po = pos.find((p) => p.id === selectedPoId);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId: selectedPoId,
          vendorId: po?.vendorId,
          warehouseId,
          vehicleNo,
          invoiceNo,
          remarks,
          items,
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
      accessorKey: "grnNo",
      header: "GRN Number",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.grnNo}</span>,
    },
    {
      accessorKey: "receiptDate",
      header: "Receipt Date",
      cell: ({ row }: any) => new Date(row.original.receiptDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "po",
      header: "PO Reference",
      cell: ({ row }: any) => row.original.po?.poNo || "N/A",
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "warehouse",
      header: "Warehouse",
      cell: ({ row }: any) => row.original.warehouse?.name || "Central Warehouse",
    },
    {
      accessorKey: "receivedByName",
      header: "Received By",
    },
    {
      accessorKey: "status",
      header: "Quality Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status || "COMPLETED"} />,
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Material Receipt (GRN) & Quality Check</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Record Goods Receipt Note (GRN), inspect incoming batches, and automatically update warehouse available stock.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Create Goods Receipt Note (GRN)
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={receipts}
        searchPlaceholder="Search Material Receipts (GRN-2026-..., Vendor, PO No)..."
      />

      {/* Create GRN Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Goods Receipt Note (GRN)"
        subtitle="Record received quantities, batch numbers, and perform quality check."
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Purchase Order"
              value={selectedPoId}
              onChange={(e) => handlePoChange(e.target.value)}
              options={pos.map((p) => ({ label: `${p.poNo} - ${p.vendor?.name}`, value: p.id }))}
            />
            <Select
              label="Receiving Warehouse"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Vehicle Number" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
            <Input label="Vendor Invoice Number" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </div>

          {/* Line items with auto calculation */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
              Receipt & Quality Inspection Breakdown
            </h4>

            {items.map((row, idx) => {
              const acc = Math.max(0, Number(row.receivedQty || 0) - Number(row.rejectedQty || 0) - Number(row.damagedQty || 0));
              return (
                <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 dark:text-slate-100">{row.materialName}</span>
                    <span className="text-blue-600">Ordered Qty: {row.orderedQty}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      label="Received Qty"
                      type="number"
                      value={row.receivedQty}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].receivedQty = e.target.value;
                        setItems(updated);
                      }}
                    />
                    <Input
                      label="Rejected Qty"
                      type="number"
                      value={row.rejectedQty}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].rejectedQty = e.target.value;
                        setItems(updated);
                      }}
                    />
                    <Input
                      label="Damaged Qty"
                      type="number"
                      value={row.damagedQty}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].damagedQty = e.target.value;
                        setItems(updated);
                      }}
                    />
                    <div className="flex flex-col justify-end pb-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Accepted Qty:</div>
                      <div className="text-sm font-black text-emerald-600">{acc} pcs</div>
                    </div>
                  </div>

                  <Input
                    label="Batch Number"
                    value={row.batchNo}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].batchNo = e.target.value;
                      setItems(updated);
                    }}
                  />
                </div>
              );
            })}
          </div>

          <Input
            label="GRN Remarks / Store Notes"
            placeholder="e.g. Received in 10 wooden crates, 5 pcs rejected due to surface scratches."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateGRN} isLoading={isSubmitting} className="font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Create GRN & Update Inventory Stock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
