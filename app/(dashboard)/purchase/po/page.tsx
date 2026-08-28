"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, Printer, FileText, Send, CheckCircle2, Truck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function PurchaseOrderPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs state
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pdfPo, setPdfPo] = useState<any>(null);

  // Create Form State
  const [vendorId, setVendorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("Central Warehouse Mumbai, Plot 42, Bhiwandi, Thane, MH");
  const [billingAddress, setBillingAddress] = useState("Headquarters, PurchaseFlow Corp, Worli, Mumbai 400018");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [deliveryTerms, setDeliveryTerms] = useState("FOR Destination");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [freight, setFreight] = useState("2000");
  const [discount, setDiscount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<any[]>([
    { materialId: "", quantity: 200, rate: 250, discountPercent: 5, gstPercent: 18 },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poRes, masterRes] = await Promise.all([fetch("/api/pos"), fetch("/api/masters")]);
      const poData = await poRes.json();
      const masterData = await masterRes.json();

      setPos(Array.isArray(poData) ? poData : []);
      setVendors(masterData.vendors || []);
      setMaterials(masterData.materials || []);
      setDepartments(masterData.departments || []);

      if (masterData.vendors?.length) setVendorId(masterData.vendors[0].id);
      if (masterData.departments?.length) setDepartmentId(masterData.departments[0].id);
      if (masterData.materials?.length) {
        setItems([{ materialId: masterData.materials[0].id, quantity: 200, rate: 250, discountPercent: 5, gstPercent: 18 }]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePO = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          departmentId,
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
        setIsCreateOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const pendingPos = pos.filter((p) => ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(p.status));
  const historyPos = pos.filter((p) => ["SENT", "IN_PROGRESS", "PARTIALLY_COMPLETED", "COMPLETED", "CANCELLED"].includes(p.status));
  const activeData = activeTab === "pending" ? pendingPos : historyPos;

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
      header: "Vendor",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: "Expected Delivery",
      cell: ({ row }: any) => new Date(row.original.expectedDeliveryDate).toLocaleDateString("en-IN"),
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
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPdfPo(row.original)}
          className="h-7 text-xs"
        >
          <Printer className="w-3.5 h-3.5 mr-1 text-slate-600" /> Print / PDF
        </Button>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Order (PO) Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate legally binding purchase orders, route for multi-level approval, and dispatch to vendors.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Create Purchase Order
        </Button>
      </div>

      <WorkflowTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingPos.length}
        historyCount={historyPos.length}
      />

      <DataTable
        columns={columns}
        data={activeData}
        searchPlaceholder="Search Purchase Orders (PO-2026-..., Vendor Name)..."
      />

      {/* Create PO Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Purchase Order (PO)"
        subtitle="Generate legal purchase order with automated tax calculation."
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Vendor"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              options={vendors.map((v) => ({ label: `${v.name} (${v.code})`, value: v.id }))}
            />
            <Select
              label="Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={departments.map((d) => ({ label: d.name, value: d.id }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Payment Terms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
            <Input label="Delivery Terms" value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} />
            <Input label="Expected Delivery Date" type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Delivery Address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
            <Input label="Billing Address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
          </div>

          {/* Line items */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">PO Line Items</h4>
            {items.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-md border border-slate-200 dark:border-slate-800">
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
                    placeholder="Rate"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Freight Charges (₹)" type="number" value={freight} onChange={(e) => setFreight(e.target.value)} />
            <Input label="Discount (₹)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreatePO} isLoading={isSubmitting}>
              Submit PO for Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enterprise Printable PDF Template Modal (Requirement #29) */}
      {pdfPo && (
        <Modal
          isOpen={!!pdfPo}
          onClose={() => setPdfPo(null)}
          title={`Purchase Order PDF Preview: ${pdfPo.poNo}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 bg-white text-slate-900 p-8 rounded-xl border border-slate-300 font-sans shadow-2xl print:p-0 print:border-none">
            {/* PDF Header */}
            <div className="flex justify-between items-start border-b border-slate-300 pb-6">
              <div>
                <div className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 text-white font-black text-xl rounded shadow-md">
                  PurchaseFlow
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-2">PurchaseFlow Enterprises India Pvt Ltd</h2>
                <p className="text-xs text-slate-600">Plot 42, Worli Commercial Complex, Mumbai - 400018</p>
                <p className="text-xs text-slate-600">GSTIN: 27AAACP9999P1Z3 • Phone: +91 22 6600 1122</p>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-black text-blue-700 tracking-wider">PURCHASE ORDER</h1>
                <div className="text-xs text-slate-600 font-mono mt-1">PO #: <strong>{pdfPo.poNo}</strong></div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Date: <strong>{new Date(pdfPo.poDate).toLocaleDateString("en-IN")}</strong>
                </div>
                <div className="mt-2">
                  <StatusBadge status={pdfPo.status} />
                </div>
              </div>
            </div>

            {/* Vendor & Delivery Addresses */}
            <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">VENDOR DETAILS:</h4>
                <div className="font-bold text-sm text-slate-900">{pdfPo.vendor?.name}</div>
                <div>Contact: {pdfPo.vendor?.contactPerson} ({pdfPo.vendor?.phone})</div>
                <div>Email: {pdfPo.vendor?.email}</div>
                <div>GSTIN: {pdfPo.vendor?.gstNumber}</div>
                <div>PAN: {pdfPo.vendor?.pan}</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">DELIVERY & BILLING:</h4>
                <div><strong>Delivery:</strong> {pdfPo.deliveryAddress}</div>
                <div className="mt-1"><strong>Billing:</strong> {pdfPo.billingAddress}</div>
                <div className="mt-1"><strong>Expected Delivery:</strong> {new Date(pdfPo.expectedDeliveryDate).toLocaleDateString("en-IN")}</div>
              </div>
            </div>

            {/* Item Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Material Description</th>
                    <th className="p-2.5">Qty</th>
                    <th className="p-2.5">Rate (₹)</th>
                    <th className="p-2.5">Disc %</th>
                    <th className="p-2.5">GST %</th>
                    <th className="p-2.5 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pdfPo.items?.map((it: any, index: number) => (
                    <tr key={it.id || index}>
                      <td className="p-2.5">{index + 1}</td>
                      <td className="p-2.5 font-bold">{it.material?.name || "Item Spec"}</td>
                      <td className="p-2.5">{it.quantity} {it.unit?.symbol || "pcs"}</td>
                      <td className="p-2.5">₹{it.rate}</td>
                      <td className="p-2.5">{it.discountPercent}%</td>
                      <td className="p-2.5">{it.gstPercent}%</td>
                      <td className="p-2.5 text-right font-bold">₹{it.totalAmount?.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-1.5 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Freight & Handling:</span>
                  <span>₹{pdfPo.freight?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">GST Amount:</span>
                  <span>₹{pdfPo.gstAmount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-blue-700 border-t border-slate-300 pt-2">
                  <span>Grand Total:</span>
                  <span>₹{pdfPo.grandTotal?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Terms & Signature */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-300 text-xs">
              <div>
                <h5 className="font-bold text-slate-800 uppercase text-[10px] mb-1">TERMS & CONDITIONS:</h5>
                <ol className="list-decimal pl-4 space-y-0.5 text-slate-600 text-[11px]">
                  <li>Goods must be delivered as per agreed specifications.</li>
                  <li>Mention PO Number on all invoices and packaging labels.</li>
                  <li>Payment Terms: {pdfPo.paymentTerms}.</li>
                </ol>
              </div>
              <div className="text-right flex flex-col items-end justify-end">
                <div className="border-b border-slate-400 w-48 pb-1 text-center font-bold text-slate-800">
                  Authorized Signatory
                </div>
                <div className="text-[10px] text-slate-500 mt-1">PurchaseFlow Procurement Division</div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 print:hidden">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" /> Print Document
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-1.5" /> Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
