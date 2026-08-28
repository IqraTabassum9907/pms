"use client";

import React, { useEffect, useState } from "react";
import { PackageCheck, Plus, Eye, CheckCircle2, ShieldCheck, ArrowRight, DollarSign, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import Link from "next/link";

export default function MaterialReceiptPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("MH-12 AB 4589");
  const [invoiceNo, setInvoiceNo] = useState("INV-2026-0988");
  const [remarks, setRemarks] = useState("Goods inspected and received in good condition.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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

  const openGRNForPO = (po: any) => {
    setSelectedPoId(po.id);
    setupPoItems(po);
    setIsAddOpen(true);
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
        const newGRN = await res.json();
        setIsAddOpen(false);
        setSuccessNotice(`GRN ${newGRN.grnNo} recorded successfully! Inventory stock increased & advanced to Payment Desk.`);
        fetchData();
        setActiveTab("history");
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  // Pending Tab: Active POs waiting to be received
  // History Tab: Generated GRN Receipts
  const pendingPOs = pos;
  const historyGRNs = receipts;

  const pendingColumns = [
    {
      accessorKey: "poNo",
      header: "PO Number",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.poNo}</span>,
    },
    {
      accessorKey: "poDate",
      header: "Order Date",
      cell: ({ row }: any) => new Date(row.original.poDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "vendor",
      header: "Supplier",
      cell: ({ row }: any) => <span className="font-semibold">{row.original.vendor?.name || "Vendor"}</span>,
    },
    {
      accessorKey: "items",
      header: "Expected Materials",
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
        <Button
          variant="primary"
          size="sm"
          onClick={() => openGRNForPO(row.original)}
          className="h-7 text-xs font-bold"
        >
          <PackageCheck className="w-3.5 h-3.5 mr-1" /> Create GRN & QC
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      accessorKey: "grnNo",
      header: "GRN Number",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.grnNo}</span>,
    },
    {
      accessorKey: "receiptDate",
      header: "Receipt Date",
      cell: ({ row }: any) => new Date(row.original.receiptDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "po",
      header: "Against PO",
      cell: ({ row }: any) => row.original.po?.poNo || "PO-2026",
    },
    {
      accessorKey: "vendor",
      header: "Supplier",
      cell: ({ row }: any) => <span className="font-semibold">{row.original.vendor?.name || "Vendor"}</span>,
    },
    {
      accessorKey: "warehouse",
      header: "Warehouse",
      cell: ({ row }: any) => row.original.warehouse?.name || "Central WH",
    },
    {
      accessorKey: "receivedByName",
      header: "Received By",
    },
    {
      accessorKey: "status",
      header: "GRN Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedReceipt(row.original)}
            className="h-7 text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> View GRN
          </Button>
          <Link href="/purchase/payment">
            <Button variant="secondary" size="sm" className="h-7 text-xs font-bold">
              <DollarSign className="w-3.5 h-3.5 mr-1" /> Pay Invoice
            </Button>
          </Link>
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
          <h1 className="text-2xl font-bold tracking-tight">Material Receipt & GRN Desk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Perform inward gate entry, record batch numbers, execute quality inspection checks, and increase warehouse stock.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddOpen(true)} className="font-bold">
            <Plus className="w-4 h-4 mr-2" /> Inward Goods Receipt
          </Button>
          <Link href="/purchase/stock">
            <Button variant="outline" className="font-bold text-xs">
              <Boxes className="w-4 h-4 mr-1" /> Live Inventory
            </Button>
          </Link>
        </div>
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
        pendingCount={pendingPOs.length}
        historyCount={historyGRNs.length}
      />

      {/* Data Table */}
      {activeTab === "pending" ? (
        <DataTable
          columns={pendingColumns}
          data={pendingPOs}
          searchPlaceholder="Search active POs awaiting delivery (PO-2026-..., Vendor)..."
        />
      ) : (
        <DataTable
          columns={historyColumns}
          data={historyGRNs}
          searchPlaceholder="Search completed GRN records..."
        />
      )}

      {/* Inward GRN Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Goods Receipt Note (GRN) & QC Record"
        subtitle="Verify delivered quantity against PO, capture invoice, and assign storage warehouse."
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Purchase Order"
              value={selectedPoId}
              onChange={(e) => {
                setSelectedPoId(e.target.value);
                const po = pos.find((p) => p.id === e.target.value);
                if (po) setupPoItems(po);
              }}
              options={pos.map((p) => ({ label: `${p.poNo} - ${p.vendor?.name} (₹${Number(p.grandTotal || 0).toLocaleString("en-IN")})`, value: p.id }))}
            />
            <Select
              label="Destination Warehouse"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              options={warehouses.map((w) => ({ label: `${w.code} - ${w.name}`, value: w.id }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Delivery Vehicle Number"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
            />
            <Input
              label="Supplier Invoice / Delivery Challan No"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>

          {/* Item QC Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50 space-y-2">
            <h4 className="font-bold uppercase text-[11px] text-slate-700 dark:text-slate-300">
              Material Inward & Quality Inspection Verification
            </h4>
            {items.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="col-span-4">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">{row.materialName}</span>
                  <span className="text-[10px] text-slate-400">Ord: {row.orderedQty} pcs</span>
                </div>
                <div className="col-span-3">
                  <Input
                    label="Rec. Qty"
                    type="number"
                    value={row.receivedQty}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].receivedQty = Number(e.target.value);
                      setItems(updated);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Rej. Qty"
                    type="number"
                    value={row.rejectedQty}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].rejectedQty = Number(e.target.value);
                      setItems(updated);
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    label="Batch Code"
                    value={row.batchNo}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].batchNo = e.target.value;
                      setItems(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Input
            label="Inspector Remarks & Storage Notes"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateGRN} isLoading={isSubmitting} className="font-bold">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Post GRN & Update Inventory
            </Button>
          </div>
        </div>
      </Modal>

      {/* View GRN Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Material Receipt GRN: ${selectedReceipt.grnNo}`}
          subtitle={`Warehouse: ${selectedReceipt.warehouse?.name}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <span className="text-slate-400 font-semibold block">Date:</span>
                <span className="font-bold">{new Date(selectedReceipt.receiptDate).toLocaleDateString("en-IN")}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Against PO:</span>
                <span className="font-bold text-blue-600">{selectedReceipt.po?.poNo}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Supplier:</span>
                <span className="font-bold">{selectedReceipt.vendor?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Invoice Ref:</span>
                <span className="font-bold">{selectedReceipt.invoiceNo || "N/A"}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Received & Accepted Stock Lines:</h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <tr>
                      <th className="p-2">Material</th>
                      <th className="p-2">Ordered</th>
                      <th className="p-2">Received</th>
                      <th className="p-2">Accepted</th>
                      <th className="p-2">Rejected</th>
                      <th className="p-2">Batch No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedReceipt.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="p-2 font-medium">{it.material?.name}</td>
                        <td className="p-2">{it.orderedQty}</td>
                        <td className="p-2">{it.receivedQty}</td>
                        <td className="p-2 font-bold text-emerald-600">{it.acceptedQty}</td>
                        <td className="p-2 text-rose-600">{it.rejectedQty}</td>
                        <td className="p-2 font-mono text-[11px]">{it.batchNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link href="/purchase/payment">
                <Button variant="secondary" size="sm" className="font-bold">
                  <DollarSign className="w-3.5 h-3.5 mr-1" /> Process Payment for this Invoice
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
