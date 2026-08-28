"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, Printer, FileText, Send, CheckCircle2, ArrowRight, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PurchaseOrderContent() {
  const searchParams = useSearchParams();
  const [pos, setPos] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs state
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pdfPo, setPdfPo] = useState<any>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Create Form State
  const [vendorId, setVendorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("Central Warehouse Mumbai, Plot 42, Bhiwandi, Thane, MH");
  const [billingAddress, setBillingAddress] = useState("Headquarters, PurchaseFlow Corp, Worli, Mumbai 400018");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [deliveryTerms, setDeliveryTerms] = useState("FOR Destination");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [freight, setFreight] = useState("5000");
  const [discount, setDiscount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<any[]>([
    { materialId: "", quantity: 100, rate: 250, discountPercent: 0, gstPercent: 18 },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poRes, quoRes, masterRes] = await Promise.all([
        fetch("/api/pos"),
        fetch("/api/quotations"),
        fetch("/api/masters"),
      ]);
      const poData = await poRes.json();
      const quoData = await quoRes.json();
      const masterData = await masterRes.json();

      setPos(Array.isArray(poData) ? poData : []);
      setQuotations(Array.isArray(quoData) ? quoData : []);
      setVendors(masterData.vendors || []);
      setMaterials(masterData.materials || []);
      setDepartments(masterData.departments || []);

      if (masterData.vendors?.length) setVendorId(masterData.vendors[0].id);
      if (masterData.departments?.length) setDepartmentId(masterData.departments[0].id);
      if (masterData.materials?.length) {
        setItems([{ materialId: masterData.materials[0].id, quantity: 100, rate: 250, discountPercent: 0, gstPercent: 18 }]);
      }

      // Check if quotationId in URL
      const qId = searchParams?.get("quotationId");
      if (qId && Array.isArray(quoData)) {
        const quote = quoData.find((q: any) => q.id === qId);
        if (quote) {
          openPOCreationFromQuote(quote);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPOCreationFromQuote = (quote: any) => {
    setQuotationId(quote.id);
    if (quote.vendorId) setVendorId(quote.vendorId);
    if (quote.paymentTerms) setPaymentTerms(quote.paymentTerms);
    if (quote.deliveryTerms) setDeliveryTerms(quote.deliveryTerms);
    if (quote.freight) setFreight(String(quote.freight));
    if (quote.items?.length) {
      setItems(
        quote.items.map((it: any) => ({
          materialId: it.materialId,
          quantity: it.quantity,
          rate: it.rate,
          discountPercent: it.discountPercent || 0,
          gstPercent: it.gstPercent || 18,
        }))
      );
    }
    setIsCreateOpen(true);
  };

  const handleCreatePO = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          departmentId,
          quotationId: quotationId || null,
          deliveryAddress,
          billingAddress,
          paymentTerms,
          deliveryTerms,
          expectedDeliveryDate,
          freight,
          discount,
          items,
        }),
      });

      if (res.ok) {
        const newPO = await res.json();
        setIsCreateOpen(false);
        setSuccessNotice(`Purchase Order ${newPO.poNo} created successfully! Advanced to PO Approval desk.`);
        fetchData();
        setActiveTab("history"); // Show issued POs
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  // Pending Tab: POs awaiting approval or Selected Quotes waiting for PO generation
  const pendingPOs = pos.filter((p) => ["PENDING_APPROVAL", "DRAFT"].includes(p.status));
  const historyPOs = pos.filter((p) => ["APPROVED", "SENT", "IN_PROGRESS", "PARTIALLY_COMPLETED", "COMPLETED", "REJECTED", "CANCELLED"].includes(p.status));
  const activeData = activeTab === "pending" ? pendingPOs : historyPOs;

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
      accessorKey: "department",
      header: "Department",
      cell: ({ row }: any) => row.original.department?.name || "N/A",
    },
    {
      accessorKey: "items",
      header: "Line Items",
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
      header: "Grand Total",
      cell: ({ row }: any) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          ₹{Number(row.original.grandTotal || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "PO Status",
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
            onClick={() => setPdfPo(row.original)}
            className="h-7 text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> View PO
          </Button>
          {row.original.status === "PENDING_APPROVAL" && (
            <Link href="/purchase/po-approval">
              <Button variant="primary" size="sm" className="h-7 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Go to Approval
              </Button>
            </Link>
          )}
          {row.original.status === "APPROVED" && (
            <Link href="/purchase/po-dispatch">
              <Button variant="primary" size="sm" className="h-7 text-xs font-bold">
                <Send className="w-3.5 h-3.5 mr-1" /> Dispatch
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Order (PO) Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate legally binding purchase contracts, enforce taxation, payment terms, and monitor dispatch timelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateOpen(true)} className="font-bold">
            <Plus className="w-4 h-4 mr-2" /> Create Purchase Order
          </Button>
          <Link href="/purchase/po-approval">
            <Button variant="secondary" className="font-bold">
              PO Approval Desk <ArrowRight className="w-4 h-4 ml-1" />
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
        pendingCount={pendingPOs.length}
        historyCount={historyPOs.length}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={activeData}
        searchPlaceholder="Search POs (PO-2026-..., Vendor, Department)..."
      />

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Generate Purchase Order Contract"
        subtitle="Configure supplier, delivery destination, commercial terms, and item lines."
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Supplier / Vendor"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              options={vendors.map((v) => ({ label: `${v.code} - ${v.name} (${v.city})`, value: v.id }))}
            />
            <Select
              label="Issuing Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={departments.map((d) => ({ label: d.name, value: d.id }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Delivery Destination Address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
            <Input
              label="Billing Address"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
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
              label="Expected Delivery Date"
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            />
          </div>

          {/* Line items */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold uppercase text-[11px] text-slate-700 dark:text-slate-300">Contract Item Lines</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setItems([
                    ...items,
                    { materialId: materials[0]?.id || "", quantity: 50, rate: 150, discountPercent: 0, gstPercent: 18 },
                  ])
                }
              >
                + Add Item
              </Button>
            </div>

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
                <div className="col-span-2">
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
                <div className="col-span-3 text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ₹{(Number(row.quantity || 0) * Number(row.rate || 0) * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreatePO} isLoading={isSubmitting} className="font-bold">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Generate PO & Advance to Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* PO View Modal */}
      {pdfPo && (
        <Modal
          isOpen={!!pdfPo}
          onClose={() => setPdfPo(null)}
          title={`Purchase Order Document: ${pdfPo.poNo}`}
          subtitle={`Supplier: ${pdfPo.vendor?.name}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <span className="text-slate-400 font-semibold block">PO Date:</span>
                <span className="font-bold">{new Date(pdfPo.poDate).toLocaleDateString("en-IN")}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Supplier:</span>
                <span className="font-bold">{pdfPo.vendor?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Payment Terms:</span>
                <span className="font-bold">{pdfPo.paymentTerms}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Status:</span>
                <StatusBadge status={pdfPo.status} />
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Item Specifications:</h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <tr>
                      <th className="p-2">Material</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Rate</th>
                      <th className="p-2">GST</th>
                      <th className="p-2 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pdfPo.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="p-2 font-medium">{it.material?.name}</td>
                        <td className="p-2">{it.quantity} {it.unit?.symbol || "pcs"}</td>
                        <td className="p-2">₹{Number(it.rate || 0).toLocaleString("en-IN")}</td>
                        <td className="p-2">{it.gstPercent || 18}%</td>
                        <td className="p-2 text-right font-bold">₹{Number(it.totalAmount || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900 font-bold text-xs">
              <span>Grand Total (Including Taxes & Freight):</span>
              <span className="text-blue-600 text-sm">₹{Number(pdfPo.grandTotal || 0).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setPdfPo(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function PurchaseOrderPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PurchaseOrderContent />
    </Suspense>
  );
}
