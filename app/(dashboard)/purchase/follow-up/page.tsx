"use client";

import React, { useEffect, useState } from "react";
import { PhoneCall, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function FollowUpPage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [actionTaken, setActionTaken] = useState("CALL");
  const [remarks, setRemarks] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [folRes, poRes] = await Promise.all([fetch("/api/follow-ups"), fetch("/api/pos")]);
      const folData = await folRes.json();
      const poData = await poRes.json();

      setFollowUps(Array.isArray(folData) ? folData : []);
      // Dispatched/in-transit POs still awaiting delivery are the ones that need vendor follow-up.
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

  const openFollowUpForPO = (po: any) => {
    setSelectedPoId(po.id);
    setIsAddOpen(true);
  };

  const handleAddFollowUp = async (status: "IN_PROGRESS" | "COMPLETED") => {
    setIsSubmitting(true);
    const selectedPo = pos.find((p) => p.id === selectedPoId);
    try {
      const res = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId: selectedPoId,
          vendorId: selectedPo?.vendorId,
          actionTaken,
          remarks,
          nextFollowUpDate,
          status,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setIsAddOpen(false);
        setSuccessNotice(`Follow-up logged for ${created.entityNo || selectedPo?.poNo || "PO"}! Moved to History.`);
        fetchData();
        setActiveTab("history");
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  // Pending Tab: Dispatched POs still awaiting delivery (source list, like Receipt/Returns)
  // History Tab: Follow-up communications already logged
  const pendingPOs = pos;
  const historyFollowUps = followUps;

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
          onClick={() => openFollowUpForPO(row.original)}
          className="h-7 text-xs font-bold"
        >
          <PhoneCall className="w-3.5 h-3.5 mr-1" /> Log Follow-Up
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      accessorKey: "po",
      header: "Reference Order",
      cell: ({ row }: any) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {row.original.po?.poNo || row.original.entityNo || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "vendor",
      header: "Vendor Name",
      cell: ({ row }: any) => row.original.vendor?.name || "Vendor Partner",
    },
    {
      accessorKey: "actionTaken",
      header: "Channel",
      cell: ({ row }: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 border">
          <PhoneCall className="w-3 h-3 mr-1 text-blue-500" /> {row.original.actionTaken || "CALL"}
        </span>
      ),
    },
    {
      accessorKey: "followUpDate",
      header: "Last Follow-Up",
      cell: ({ row }: any) => {
        const d = row.original.followUpDate || row.original.createdAt;
        return d ? new Date(d).toLocaleDateString("en-IN") : "Recent";
      },
    },
    {
      accessorKey: "nextFollowUpDate",
      header: "Next Follow-Up / Due",
      cell: ({ row }: any) => {
        const d = row.original.nextFollowUpDate || row.original.dueDate;
        return d ? new Date(d).toLocaleDateString("en-IN") : "Completed";
      },
    },
    {
      accessorKey: "remarks",
      header: "Follow-Up Notes",
      cell: ({ row }: any) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 italic truncate max-w-xs block">
          {row.original.remarks || row.original.message || row.original.subject || "Order follow-up recorded."}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status || "PENDING"} />,
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Follow-Up Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track vendor order dispatch schedules, delivery commitments, and record communication history.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Record Follow-Up Note
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
        historyCount={historyFollowUps.length}
      />

      {activeTab === "pending" ? (
        <DataTable
          columns={pendingColumns}
          data={pendingPOs}
          searchPlaceholder="Search dispatched POs awaiting delivery (PO-2026-..., Vendor)..."
        />
      ) : (
        <DataTable
          columns={historyColumns}
          data={historyFollowUps}
          searchPlaceholder="Search vendor follow-ups (PO No, Vendor Name)..."
        />
      )}

      {/* Record Follow Up Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Vendor Follow-Up Communication"
        subtitle="Log call, email, or meeting details with vendor."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <Select
            label="Select Active Purchase Order"
            value={selectedPoId}
            onChange={(e) => setSelectedPoId(e.target.value)}
            options={pos.map((p) => ({ label: `${p.poNo} - ${p.vendor?.name}`, value: p.id }))}
          />

          <Select
            label="Communication Channel"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            options={[
              { label: "Phone Call", value: "CALL" },
              { label: "Official Email", value: "EMAIL" },
              { label: "WhatsApp Message", value: "WHATSAPP" },
              { label: "In-Person Meeting", value: "MEETING" },
            ]}
          />

          <Input
            label="Next Scheduled Follow-Up Date"
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
          />

          <div className="space-y-1">
            <label className="font-bold uppercase text-slate-700 dark:text-slate-300">Communication Remarks</label>
            <textarea
              rows={3}
              placeholder="e.g. Vendor confirmed materials dispatched on truck #MH-12 AB 4002"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleAddFollowUp("IN_PROGRESS")} isLoading={isSubmitting}>
              Keep In Progress
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleAddFollowUp("COMPLETED")} isLoading={isSubmitting} className="font-bold">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Follow-Up Completed
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
