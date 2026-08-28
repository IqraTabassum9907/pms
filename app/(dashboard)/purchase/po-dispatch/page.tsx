"use client";

import React, { useEffect, useState } from "react";
import { Send, CheckCircle2, Truck, Mail, MessageSquare, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import Link from "next/link";

export default function PODispatchPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [selectedPo, setSelectedPo] = useState<any>(null);

  const [dispatchMethod, setDispatchMethod] = useState("EMAIL");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("Please find attached approved Purchase Order PO-2026. Please confirm delivery schedule.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchPos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pos");
      const data = await res.json();
      setPos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPos();
  }, []);

  const openDispatchModal = (po: any) => {
    setSelectedPo(po);
    setRecipientEmail(po.vendor?.email || "");
    setMessage(`Please find attached approved Purchase Order ${po.poNo} totaling ₹${Number(po.grandTotal || 0).toLocaleString("en-IN")}. Kindly acknowledge receipt.`);
  };

  const handleDispatch = async () => {
    if (!selectedPo) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/pos/${selectedPo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISPATCH",
          dispatchMethod,
          recipientEmail: recipientEmail || selectedPo.vendor?.email,
          message,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedPo(null);
        setSuccessNotice(`Purchase Order ${updated.poNo} successfully dispatched to ${selectedPo.vendor?.name}! Moved to History & advanced to Logistics tracking.`);
        fetchPos();
        setActiveTab("history");
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const pendingDispatchPos = pos.filter((p) => p.status === "APPROVED");
  const historyDispatchedPos = pos.filter((p) => ["SENT", "IN_PROGRESS", "PARTIALLY_COMPLETED", "COMPLETED"].includes(p.status));
  const activeData = activeTab === "pending" ? pendingDispatchPos : historyDispatchedPos;

  const columns = [
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
      accessorKey: "vendorEmail",
      header: "Supplier Contact Email",
      cell: ({ row }: any) => row.original.vendor?.email || "N/A",
    },
    {
      accessorKey: "grandTotal",
      header: "Contract Value",
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
        activeTab === "pending" ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => openDispatchModal(row.original)}
            className="h-7 text-xs font-bold"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Dispatch to Vendor
          </Button>
        ) : (
          <Link href="/purchase/logistics">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Truck className="w-3.5 h-3.5 mr-1" /> Track Logistics
            </Button>
          </Link>
        )
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Order Dispatch Desk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transmit approved purchase contracts electronically or via supplier portal, and notify vendor sales teams.
          </p>
        </div>
        <Link href="/purchase/logistics">
          <Button variant="outline" className="text-xs">
            Go to Logistics Tracking <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
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
        pendingCount={pendingDispatchPos.length}
        historyCount={historyDispatchedPos.length}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={activeData}
        searchPlaceholder="Search POs for dispatch (PO-2026-..., Vendor)..."
      />

      {/* Dispatch Modal Form */}
      {selectedPo && (
        <Modal
          isOpen={!!selectedPo}
          onClose={() => setSelectedPo(null)}
          title={`Dispatch Purchase Order: ${selectedPo.poNo}`}
          subtitle={`Supplier: ${selectedPo.vendor?.name} | Value: ₹${Number(selectedPo.grandTotal || 0).toLocaleString("en-IN")}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900">
              <span className="font-bold text-blue-900 dark:text-blue-200 block mb-1">Electronic Transmittal Details:</span>
              <p className="text-slate-600 dark:text-slate-400">
                This action will send formal PDF purchase order documentation to the supplier and transition the order to active procurement status.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Dispatch Channel / Method"
                value={dispatchMethod}
                onChange={(e) => setDispatchMethod(e.target.value)}
                options={[
                  { label: "Email (Direct PDF Transmittal)", value: "EMAIL" },
                  { label: "Vendor Portal Integration", value: "PORTAL" },
                  { label: "Physical Courier / Speed Post", value: "COURIER" },
                  { label: "Manual Handover", value: "MANUAL" },
                ]}
              />
              <Input
                label="Recipient Supplier Email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block text-slate-700 dark:text-slate-300">
                Dispatch Transmittal Message:
              </label>
              <textarea
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedPo(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDispatch}
                isLoading={isSubmitting}
                className="font-bold"
              >
                <Send className="w-4 h-4 mr-1" /> Confirm Dispatch & Advance to Logistics
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
