"use client";

import React, { useEffect, useState } from "react";
import { Truck, Plus, CheckCircle2, ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import Link from "next/link";

export default function LogisticsPage() {
  const [logistics, setLogistics] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("MH-12 AB 4589");
  const [vehicleType, setVehicleType] = useState("14-Ft Container Truck");
  const [transporter, setTransporter] = useState("VRL Logistics Ltd");
  const [driverName, setDriverName] = useState("Suresh Kumar");
  const [driverPhone, setDriverPhone] = useState("+91 98200 98765");
  const [freight, setFreight] = useState("5000");
  const [status, setStatus] = useState("IN_TRANSIT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logRes, poRes] = await Promise.all([fetch("/api/logistics"), fetch("/api/pos")]);
      const logData = await logRes.json();
      const poData = await poRes.json();

      setLogistics(Array.isArray(logData) ? logData : []);
      // Pending source list: POs just dispatched by Purchase and still awaiting a
      // transport arrangement. Once logistics is recorded, the PO advances to
      // IN_PROGRESS and drops out of this list automatically.
      const dispatchedPOs = (Array.isArray(poData) ? poData : []).filter((p) => p.status === "SENT");
      setPos(dispatchedPOs);
      if (dispatchedPOs.length) setSelectedPoId(dispatchedPOs[0].id);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openLogisticsForPO = (po: any) => {
    setSelectedPoId(po.id);
    setIsAddOpen(true);
  };

  const handleCreateLogistics = async () => {
    setIsSubmitting(true);
    const po = pos.find((p) => p.id === selectedPoId);
    try {
      const res = await fetch("/api/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId: selectedPoId,
          vendorId: po?.vendorId,
          vehicleNo,
          vehicleType,
          transporter,
          driverName,
          driverPhone,
          freight,
          status,
        }),
      });

      if (res.ok) {
        const record = await res.json();
        setIsAddOpen(false);
        setSuccessNotice(`Logistics arrangement recorded for ${record.po?.poNo || "PO"} via ${transporter}! Moved to History & advanced to Material Receipt.`);
        fetchData();
        setActiveTab("history");
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  // Pending Tab: Dispatched POs still needing a transport arrangement (source list,
  // same convention as Receipt/Returns/Follow-up)
  // History Tab: Logistics consignments already recorded
  const pendingPOs = pos;
  const historyLogistics = logistics;

  const pendingColumns = [
    {
      accessorKey: "poNo",
      header: "PO Number",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.poNo}</span>,
    },
    {
      accessorKey: "vendor",
      header: "Supplier / Vendor",
      cell: ({ row }: any) => <span className="font-semibold">{row.original.vendor?.name || "Vendor"}</span>,
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: "Expected Delivery",
      cell: ({ row }: any) =>
        row.original.expectedDeliveryDate ? new Date(row.original.expectedDeliveryDate).toLocaleDateString("en-IN") : "N/A",
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
          onClick={() => openLogisticsForPO(row.original)}
          className="h-7 text-xs font-bold"
        >
          <Truck className="w-3.5 h-3.5 mr-1" /> Arrange Transport
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      accessorKey: "po",
      header: "PO Reference",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.po?.poNo || "PO-2026"}</span>,
    },
    {
      accessorKey: "vendor",
      header: "Supplier / Vendor",
      cell: ({ row }: any) => <span className="font-semibold">{row.original.vendor?.name || "Vendor"}</span>,
    },
    {
      accessorKey: "transporter",
      header: "Transporter & Vehicle",
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.original.transporter}</div>
          <div className="text-[10px] text-slate-500 font-mono">{row.original.vehicleNo} ({row.original.vehicleType})</div>
        </div>
      ),
    },
    {
      accessorKey: "driverName",
      header: "Driver Details",
      cell: ({ row }: any) => (
        <div className="text-xs">
          <div>{row.original.driverName}</div>
          <div className="text-[10px] text-slate-400">{row.original.driverPhone}</div>
        </div>
      ),
    },
    {
      accessorKey: "trackingNo",
      header: "Tracking Consignment",
      cell: ({ row }: any) => (
        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
          {row.original.trackingNo || "TRK-2026-901"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Consignment Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Action",
      cell: () => (
        <Link href="/purchase/receipt">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <PackageCheck className="w-3.5 h-3.5 mr-1" /> Create GRN Receipt
          </Button>
        </Link>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logistics & Fleet Dispatch Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track road/courier transits, monitor consignment tracking numbers, driver manifests, and expected delivery ETAs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddOpen(true)} className="font-bold">
            <Plus className="w-4 h-4 mr-2" /> Record Vehicle Dispatch
          </Button>
          <Link href="/purchase/receipt">
            <Button variant="secondary" className="font-bold">
              Material Receipt / GRN <ArrowRight className="w-4 h-4 ml-1" />
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
        historyCount={historyLogistics.length}
      />

      {/* Data Table */}
      {activeTab === "pending" ? (
        <DataTable
          columns={pendingColumns}
          data={pendingPOs}
          searchPlaceholder="Search dispatched POs awaiting transport (PO-2026-..., Vendor)..."
        />
      ) : (
        <DataTable
          columns={historyColumns}
          data={historyLogistics}
          searchPlaceholder="Search logistics (Consignment, PO Ref, Transporter)..."
        />
      )}

      {/* Add Logistics Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Transport & Logistics Manifest"
        subtitle="Specify transporter agency, vehicle registration, driver contact, and consignment tracking."
        maxWidth="3xl"
      >
        <div className="space-y-4 text-xs">
          <Select
            label="Select Dispatched Purchase Order"
            value={selectedPoId}
            onChange={(e) => setSelectedPoId(e.target.value)}
            options={pos.map((p) => ({ label: `${p.poNo} - ${p.vendor?.name} (₹${Number(p.grandTotal || 0).toLocaleString("en-IN")})`, value: p.id }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Transporter Agency Name"
              value={transporter}
              onChange={(e) => setTransporter(e.target.value)}
            />
            <Select
              label="Vehicle Body Type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              options={[
                { label: "14-Ft Closed Container Truck", value: "14-Ft Closed Container Truck" },
                { label: "20-Ft Heavy Flat Bed Trailer", value: "20-Ft Heavy Flat Bed Trailer" },
                { label: "32-Ft Multi-Axle Container", value: "32-Ft Multi-Axle Container" },
                { label: "Light Commercial Vehicle (Tata 407)", value: "Light Commercial Vehicle (Tata 407)" },
                { label: "Courier Express Delivery", value: "Courier Express Delivery" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Vehicle Registration Number"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
            />
            <Input
              label="Driver Full Name"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
            <Input
              label="Driver Contact Phone"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Agreed Freight Charges (₹)"
              type="number"
              value={freight}
              onChange={(e) => setFreight(e.target.value)}
            />
            <Select
              label="Initial Transit Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { label: "In-Transit (Dispatched from Vendor)", value: "IN_TRANSIT" },
                { label: "Dispatched from Port/SEZ", value: "DISPATCHED" },
                { label: "Delivered at Destination Warehouse", value: "DELIVERED" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateLogistics} isLoading={isSubmitting} className="font-bold">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Save Logistics & Advance to GRN
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
