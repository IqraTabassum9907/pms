"use client";

import React, { useEffect, useState } from "react";
import { PhoneCall, Mail, MessageSquare, Plus, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function FollowUpPage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [actionTaken, setActionTaken] = useState("CALL");
  const [remarks, setRemarks] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [folRes, poRes] = await Promise.all([fetch("/api/follow-ups"), fetch("/api/pos")]);
      const folData = await folRes.json();
      const poData = await poRes.json();

      setFollowUps(Array.isArray(folData) ? folData : []);
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
      header: "PO Number",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.po?.poNo || "N/A"}</span>,
    },
    {
      accessorKey: "vendor",
      header: "Vendor Name",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "actionTaken",
      header: "Action Channel",
      cell: ({ row }: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 border">
          <PhoneCall className="w-3 h-3 mr-1 text-blue-500" /> {row.original.actionTaken}
        </span>
      ),
    },
    {
      accessorKey: "followUpDate",
      header: "Last Follow-Up",
      cell: ({ row }: any) => new Date(row.original.followUpDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "nextFollowUpDate",
      header: "Next Follow-Up",
      cell: ({ row }: any) =>
        row.original.nextFollowUpDate ? new Date(row.original.nextFollowUpDate).toLocaleDateString("en-IN") : "Completed",
    },
    {
      accessorKey: "remarks",
      header: "Follow-Up Notes",
      cell: ({ row }: any) => <span className="text-xs italic truncate max-w-xs">{row.original.remarks}</span>,
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
          <h1 className="text-2xl font-bold tracking-tight">Vendor Follow-Up Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track vendor order dispatch schedules, delivery commitments, and record communication history.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Record Follow-Up Note
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={followUps}
        searchPlaceholder="Search vendor follow-ups (PO No, Vendor Name)..."
      />

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
              Mark Follow-Up Completed
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
