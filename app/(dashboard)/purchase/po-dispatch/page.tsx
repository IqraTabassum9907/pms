"use client";

import React, { useEffect, useState } from "react";
import { Send, CheckCircle2, Truck, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function PODispatchPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPo, setSelectedPo] = useState<any>(null);

  const [dispatchMethod, setDispatchMethod] = useState("EMAIL");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("Please find attached approved Purchase Order PO-2026.");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const dispatchablePos = pos.filter((p) => ["APPROVED", "SENT"].includes(p.status));

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
        setSelectedPo(null);
        fetchPos();
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const columns = [
    {
      accessorKey: "poNo",
      header: "PO Number",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.poNo}</span>,
    },
    {
      accessorKey: "vendor",
      header: "Vendor Name",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "vendorEmail",
      header: "Vendor Contact Email",
      cell: ({ row }: any) => row.original.vendor?.email || "N/A",
    },
    {
      accessorKey: "grandTotal",
      header: "Grand Total",
      cell: ({ row }: any) => (
        <span className="font-bold">₹{Number(row.original.grandTotal || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Dispatch Action",
      cell: ({ row }: any) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelectedPo(row.original);
            setRecipientEmail(row.original.vendor?.email || "");
          }}
          className="h-7 text-xs font-bold"
        >
          <Send className="w-3.5 h-3.5 mr-1" /> Simulate Dispatch
        </Button>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">PO Dispatch & Communication Simulation</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Transmit approved purchase orders to vendors via Email, Vendor Portal, or WhatsApp integration.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={dispatchablePos}
        searchPlaceholder="Search approved POs ready for dispatch..."
      />

      {selectedPo && (
        <Modal
          isOpen={!!selectedPo}
          onClose={() => setSelectedPo(null)}
          title={`Dispatch Purchase Order: ${selectedPo.poNo}`}
          subtitle={`Simulate electronic transmission to ${selectedPo.vendor?.name}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <Select
              label="Dispatch Channel"
              value={dispatchMethod}
              onChange={(e) => setDispatchMethod(e.target.value)}
              options={[
                { label: "Email (PDF Attachment)", value: "EMAIL" },
                { label: "Vendor Portal API", value: "PORTAL" },
                { label: "WhatsApp Business API", value: "WHATSAPP" },
                { label: "Manual Physical Delivery", value: "MANUAL" },
              ]}
            />

            <Input
              label="Recipient Email Address"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />

            <div className="space-y-1">
              <label className="font-bold uppercase text-slate-700 dark:text-slate-300">Dispatch Message</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedPo(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleDispatch} isLoading={isSubmitting} className="font-bold">
                <Send className="w-3.5 h-3.5 mr-1" /> Transmit & Mark Sent
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
