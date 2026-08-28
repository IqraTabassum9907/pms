"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, Quote, FileText, CheckCircle2, ArrowRight, DollarSign, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import Link from "next/link";

export default function QuotationManagementPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [indents, setIndents] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedIndentId, setSelectedIndentId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [deliveryTerms, setDeliveryTerms] = useState("FOR Destination");
  const [freight, setFreight] = useState("5000");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [items, setItems] = useState<any[]>([
    { materialId: "", quantity: 100, rate: 120, discountPercent: 0, gstPercent: 18 },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quoRes, indRes, masterRes, poRes] = await Promise.all([
        fetch("/api/quotations"),
        fetch("/api/indents"),
        fetch("/api/masters"),
        fetch("/api/pos"),
      ]);
      const quoData = await quoRes.json();
      const indData = await indRes.json();
      const masterData = await masterRes.json();
      const poData = await poRes.json();

      setQuotations(Array.isArray(quoData) ? quoData : []);
      // An approved indent stays in the RFQ queue only until a PO has actually been
      // raised against it — once that happens it has fully left the Quotation stage,
      // regardless of how many quotes were collected along the way.
      const indentIdsWithPO = new Set((Array.isArray(poData) ? poData : []).map((p: any) => p.indentId).filter(Boolean));
      const appIndents = (Array.isArray(indData) ? indData : []).filter(
        (i) => i.status === "APPROVED" && !indentIdsWithPO.has(i.id)
      );
      setIndents(appIndents);
      setVendors(masterData.vendors || []);
      setMaterials(masterData.materials || []);

      if (appIndents.length) setSelectedIndentId(appIndents[0].id);
      if (masterData.vendors?.length) setSelectedVendorId(masterData.vendors[0].id);
      if (masterData.materials?.length) {
        setItems([{ materialId: masterData.materials[0].id, quantity: 100, rate: 120, discountPercent: 0, gstPercent: 18 }]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openQuoteModalForIndent = (indent: any) => {
    setSelectedIndentId(indent.id);
    if (indent.items?.length) {
      setItems(
        indent.items.map((it: any) => ({
          materialId: it.materialId,
          quantity: it.quantity,
          rate: it.estimatedRate || 100,
          discountPercent: 0,
          gstPercent: 18,
        }))
      );
    }
    setIsAddOpen(true);
  };

  const handleCreateQuotation = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indentId: selectedIndentId,
          vendorId: selectedVendorId,
          paymentTerms,
          deliveryTerms,
          freight,
          discountAmount,
          remarks,
          items,
        }),
      });
      if (res.ok) {
        const newQ = await res.json();
        setIsAddOpen(false);
        setSuccessNotice(`Quotation ${newQ.quotationNo} recorded successfully from ${newQ.vendor?.name}! Moved to Received Quotes.`);
        fetchData();
        setActiveTab("history"); // show received quotes
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  // Tab 1: Approved Indents waiting for Quotations (Pending RFQs)
  // Tab 2: Received / Recorded Quotations (History)
  const pendingRFQIndents = indents;
  const receivedQuotations = quotations;

  const pendingColumns = [
    {
      accessorKey: "indentNo",
      header: "Indent No",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.indentNo}</span>,
    },
    {
      accessorKey: "indentDate",
      header: "Approved Date",
      cell: ({ row }: any) => new Date(row.original.indentDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }: any) => row.original.department?.name || "N/A",
    },
    {
      accessorKey: "requestedByName",
      header: "Requisitioner",
    },
    {
      accessorKey: "items",
      header: "Materials Needed",
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
      accessorKey: "totalEstimatedAmount",
      header: "Est. Budget",
      cell: ({ row }: any) => (
        <span className="font-bold">₹{Number(row.original.totalEstimatedAmount || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }: any) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => openQuoteModalForIndent(row.original)}
          className="h-7 text-xs font-bold"
        >
          <Quote className="w-3.5 h-3.5 mr-1" /> Record Vendor Quote
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      accessorKey: "quotationNo",
      header: "Quote No",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.quotationNo}</span>,
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => <span className="font-semibold">{row.original.vendor?.name || "Vendor"}</span>,
    },
    {
      accessorKey: "indent",
      header: "For Indent",
      cell: ({ row }: any) => row.original.indent?.indentNo || "IND-2026",
    },
    {
      accessorKey: "quotationDate",
      header: "Date",
      cell: ({ row }: any) => new Date(row.original.quotationDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "paymentTerms",
      header: "Payment Terms",
    },
    {
      accessorKey: "totalAmount",
      header: "Total Quote Value",
      cell: ({ row }: any) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          ₹{Number(row.original.totalAmount || 0).toLocaleString("en-IN")}
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
        <Link href="/purchase/vendor-selection">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Layers className="w-3.5 h-3.5 mr-1" /> Compare in Matrix
          </Button>
        </Link>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotation & RFQ Desk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Collect, track, and compare commercial supplier quotes against approved purchase requisitions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddOpen(true)} className="font-bold">
            <Plus className="w-4 h-4 mr-2" /> Add Supplier Quote
          </Button>
          <Link href="/purchase/vendor-selection">
            <Button variant="secondary" className="font-bold">
              Compare Quotes <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
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
        pendingCount={pendingRFQIndents.length}
        historyCount={receivedQuotations.length}
      />

      {/* Data Table */}
      {activeTab === "pending" ? (
        <DataTable
          columns={pendingColumns}
          data={pendingRFQIndents}
          searchPlaceholder="Search approved indents awaiting quotes..."
        />
      ) : (
        <DataTable
          columns={historyColumns}
          data={receivedQuotations}
          searchPlaceholder="Search received quotes by quote no or vendor..."
        />
      )}

      {/* Add Quotation Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Supplier Quotation"
        subtitle="Enter commercial terms, rates, freight, and tax breakdown."
        maxWidth="3xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Approved Indent"
              value={selectedIndentId}
              onChange={(e) => setSelectedIndentId(e.target.value)}
              options={indents.map((i) => ({ label: `${i.indentNo} - ${i.department?.name}`, value: i.id }))}
            />
            <Select
              label="Select Supplier / Vendor"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              options={vendors.map((v) => ({ label: `${v.code} - ${v.name}`, value: v.id }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Payment Terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              options={[
                { label: "Net 30 Days", value: "Net 30 Days" },
                { label: "Net 45 Days", value: "Net 45 Days" },
                { label: "Net 60 Days", value: "Net 60 Days" },
                { label: "Advance 50%", value: "Advance 50%" },
                { label: "100% Advance", value: "100% Advance" },
              ]}
            />
            <Select
              label="Delivery Terms"
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              options={[
                { label: "FOR Destination", value: "FOR Destination" },
                { label: "Ex-Works", value: "Ex-Works" },
                { label: "CIF", value: "CIF" },
                { label: "FOB", value: "FOB" },
              ]}
            />
            <Input
              label="Freight Charges (₹)"
              type="number"
              value={freight}
              onChange={(e) => setFreight(e.target.value)}
            />
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50 space-y-2">
            <h4 className="font-bold uppercase text-[11px] text-slate-700 dark:text-slate-300">Quoted Line Items</h4>
            {items.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="col-span-5">
                  <Select
                    value={row.materialId}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].materialId = e.target.value;
                      setItems(updated);
                    }}
                    options={materials.map((m) => ({ label: m.name, value: m.id }))}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].quantity = e.target.value;
                      setItems(updated);
                    }}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    type="number"
                    placeholder="Rate (₹)"
                    value={row.rate}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].rate = e.target.value;
                      setItems(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Input
            label="Remarks / Commercial Notes"
            placeholder="e.g. Rate includes standard manufacturer warranty"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateQuotation} isLoading={isSubmitting} className="font-bold">
              Save Quote & Advance to Comparison
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
