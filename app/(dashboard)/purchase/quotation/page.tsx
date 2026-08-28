"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, Quote, FileText, CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function QuotationManagementPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [indents, setIndents] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedIndentId, setSelectedIndentId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [deliveryTerms, setDeliveryTerms] = useState("FOR Destination");
  const [freight, setFreight] = useState("1500");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<any[]>([
    { materialId: "", quantity: 100, rate: 120, discountPercent: 5, gstPercent: 18 },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quoRes, indRes, masterRes] = await Promise.all([
        fetch("/api/quotations"),
        fetch("/api/indents"),
        fetch("/api/masters"),
      ]);
      const quoData = await quoRes.json();
      const indData = await indRes.json();
      const masterData = await masterRes.json();

      setQuotations(Array.isArray(quoData) ? quoData : []);
      const appIndents = (Array.isArray(indData) ? indData : []).filter((i) => i.status === "APPROVED");
      setIndents(appIndents);
      setVendors(masterData.vendors || []);
      setMaterials(masterData.materials || []);

      if (appIndents.length) setSelectedIndentId(appIndents[0].id);
      if (masterData.vendors?.length) setSelectedVendorId(masterData.vendors[0].id);
      if (masterData.materials?.length) {
        setItems([{ materialId: masterData.materials[0].id, quantity: 100, rate: 120, discountPercent: 5, gstPercent: 18 }]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      accessorKey: "quotationNo",
      header: "Quotation No",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.quotationNo}</span>,
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.original.vendor?.name}</div>
          <div className="text-[10px] text-slate-500">Rating: ⭐ {row.original.vendor?.rating}</div>
        </div>
      ),
    },
    {
      accessorKey: "indent",
      header: "Indent Ref",
      cell: ({ row }: any) => row.original.indent?.indentNo || "N/A",
    },
    {
      accessorKey: "paymentTerms",
      header: "Payment Terms",
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
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
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotation Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Receive and log commercial vendor quotes against approved purchase indents.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Record Vendor Quotation
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        searchPlaceholder="Search Quotations (QUO-2026-..., Vendor Name)..."
      />

      {/* Record Quotation Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Vendor Quotation Entry"
        subtitle="Attach vendor quote against an approved purchase indent requisition."
        maxWidth="3xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Approved Indent"
              value={selectedIndentId}
              onChange={(e) => setSelectedIndentId(e.target.value)}
              options={indents.map((i) => ({ label: `${i.indentNo} (${i.department?.name})`, value: i.id }))}
            />
            <Select
              label="Select Vendor"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              options={vendors.map((v) => ({ label: `${v.name} (${v.code})`, value: v.id }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Payment Terms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
            <Input label="Delivery Terms" value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} />
            <Input label="Freight Charges (₹)" type="number" value={freight} onChange={(e) => setFreight(e.target.value)} />
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Quoted Line Items</h4>
            {items.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-md border border-slate-200 dark:border-slate-800">
                <div className="col-span-4">
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
                <div className="col-span-2">
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
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="Quoted Rate"
                    value={row.rate}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].rate = e.target.value;
                      setItems(updated);
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="GST %"
                    value={row.gstPercent}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].gstPercent = e.target.value;
                      setItems(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Input
            label="Commercial Remarks"
            placeholder="Special discounts, validity periods or freight exclusions"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateQuotation} isLoading={isSubmitting}>
              Save Quotation Entry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
