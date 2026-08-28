"use client";

import React, { useEffect, useState } from "react";
import { Truck, Plus, Eye, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function LogisticsPage() {
  const [logistics, setLogistics] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("MH-12 AB 4589");
  const [vehicleType, setVehicleType] = useState("14-Ft Container Truck");
  const [transporter, setTransporter] = useState("VRL Logistics Ltd");
  const [driverName, setDriverName] = useState("Suresh Kumar");
  const [driverPhone, setDriverPhone] = useState("+91 98200 98765");
  const [freight, setFreight] = useState("2500");
  const [status, setStatus] = useState("IN_TRANSIT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logRes, poRes] = await Promise.all([fetch("/api/logistics"), fetch("/api/pos")]);
      const logData = await logRes.json();
      const poData = await poRes.json();

      setLogistics(Array.isArray(logData) ? logData : []);
      const activePOs = (Array.isArray(poData) ? poData : []).filter((p) => ["SENT", "IN_PROGRESS"].includes(p.status));
      setPos(activePOs);
      if (activePOs.length) setSelectedPoId(activePOs[0].id);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      accessorKey: "po",
      header: "PO Ref",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.po?.poNo || "N/A"}</span>,
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "transporter",
      header: "Transporter / Vehicle",
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
      cell: ({ row }: any) => `${row.original.driverName} (${row.original.driverPhone})`,
    },
    {
      accessorKey: "expectedArrival",
      header: "Expected Arrival",
      cell: ({ row }: any) => new Date(row.original.expectedArrival).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "status",
      header: "Shipment Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logistics & Inbound Shipment Planning</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track transporter vehicle assignments, driver contact details, freight costs, and live shipment transit.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Record Vehicle Dispatch
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={logistics}
        searchPlaceholder="Search logistics records (PO No, Transporter, Vehicle No)..."
      />

      {/* Add Logistics Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Inbound Vehicle Logistics"
        subtitle="Assign transporter, driver contact details, and tracking reference."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <Select
            label="Select Active PO"
            value={selectedPoId}
            onChange={(e) => setSelectedPoId(e.target.value)}
            options={pos.map((p) => ({ label: `${p.poNo} - ${p.vendor?.name}`, value: p.id }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Vehicle Number" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
            <Input label="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
          </div>

          <Input label="Transporter Name" value={transporter} onChange={(e) => setTransporter(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            <Input label="Driver Phone" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Freight Cost (₹)" type="number" value={freight} onChange={(e) => setFreight(e.target.value)} />
            <Select
              label="Shipment Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { label: "Vehicle Assigned", value: "VEHICLE_ASSIGNED" },
                { label: "Dispatched", value: "DISPATCHED" },
                { label: "In Transit", value: "IN_TRANSIT" },
                { label: "Delivered to Site", value: "DELIVERED" },
              ]}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateLogistics} isLoading={isSubmitting} className="font-bold">
              Save Logistics Entry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
