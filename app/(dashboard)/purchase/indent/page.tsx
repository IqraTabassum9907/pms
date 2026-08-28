"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, CheckCircle2, XCircle, FileText, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { WorkflowTabs } from "@/components/shared/workflow-tabs";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { getTATStatus } from "@/lib/tat/tat-engine";

export default function PurchaseIndentPage() {
  const [indents, setIndents] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewIndent, setViewIndent] = useState<any>(null);

  // Form State
  const [departmentId, setDepartmentId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Item rows
  const [items, setItems] = useState<any[]>([
    { materialId: "", quantity: 100, unitId: "", estimatedRate: 150, estimatedAmount: 15000 },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [indRes, masterRes] = await Promise.all([
        fetch("/api/indents"),
        fetch("/api/masters"),
      ]);
      const indData = await indRes.json();
      const masterData = await masterRes.json();

      setIndents(Array.isArray(indData) ? indData : []);
      setMaterials(masterData.materials || []);
      setDepartments(masterData.departments || []);
      setUnits(masterData.units || []);

      if (masterData.departments?.length) setDepartmentId(masterData.departments[0].id);
      if (masterData.materials?.length) {
        setItems([
          {
            materialId: masterData.materials[0].id,
            quantity: 100,
            unitId: masterData.units[0]?.id || "",
            estimatedRate: masterData.materials[0].estimatedRate || 150,
            estimatedAmount: (masterData.materials[0].estimatedRate || 150) * 100,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItemRow = () => {
    const defaultMat = materials[0];
    setItems([
      ...items,
      {
        materialId: defaultMat?.id || "",
        quantity: 50,
        unitId: units[0]?.id || "",
        estimatedRate: defaultMat?.estimatedRate || 100,
        estimatedAmount: (defaultMat?.estimatedRate || 100) * 50,
      },
    ]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === "materialId") {
      const selectedMat = materials.find((m) => m.id === value);
      if (selectedMat) {
        updated[index].estimatedRate = selectedMat.estimatedRate;
        updated[index].unitId = selectedMat.unitId;
      }
    }

    const qty = Number(updated[index].quantity) || 0;
    const rate = Number(updated[index].estimatedRate) || 0;
    updated[index].estimatedAmount = qty * rate;

    setItems(updated);
  };

  const handleCreateIndent = async (status: "DRAFT" | "SUBMITTED") => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/indents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId,
          priority,
          purpose,
          remarks,
          requiredDate,
          status,
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

  const pendingIndents = indents.filter((i) => ["SUBMITTED", "UNDER_REVIEW", "DRAFT"].includes(i.status));
  const historyIndents = indents.filter((i) => ["APPROVED", "REJECTED", "CANCELLED"].includes(i.status));
  const activeData = activeTab === "pending" ? pendingIndents : historyIndents;

  const columns = [
    {
      accessorKey: "indentNo",
      header: "Indent No",
      cell: ({ row }: any) => <span className="font-bold text-blue-600 dark:text-blue-400">{row.original.indentNo}</span>,
    },
    {
      accessorKey: "indentDate",
      header: "Indent Date",
      cell: ({ row }: any) => new Date(row.original.indentDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }: any) => row.original.department?.name || "N/A",
    },
    {
      accessorKey: "requestedByName",
      header: "Requested By",
    },
    {
      accessorKey: "items",
      header: "Material / Qty",
      cell: ({ row }: any) => {
        const item = row.original.items?.[0];
        if (!item) return "N/A";
        return (
          <span className="text-xs">
            <strong className="text-slate-900 dark:text-slate-100">{item.material?.name || "Item"}</strong> ({item.quantity} {item.unit?.symbol || "pcs"})
            {row.original.items.length > 1 && <span className="text-blue-500 font-bold ml-1">+{row.original.items.length - 1} more</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: any) => <StatusBadge status={row.original.priority} />,
    },
    {
      accessorKey: "totalEstimatedAmount",
      header: "Est. Amount",
      cell: ({ row }: any) => (
        <span className="font-bold">₹{Number(row.original.totalEstimatedAmount || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "plannedDate",
      header: "Planned (TAT)",
      cell: ({ row }: any) => {
        const tat = getTATStatus(row.original.plannedDate, row.original.actualDate);
        return (
          <span className={`text-xs font-semibold ${tat.status === "DELAYED" ? "text-rose-600" : "text-emerald-600"}`}>
            {tat.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewIndent(row.original)}
          className="h-7 text-xs"
        >
          <Eye className="w-3.5 h-3.5 mr-1" /> View
        </Button>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Indent Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Raise material requisitions, track estimated budgets, and monitor department approval timelines.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Create Purchase Indent
        </Button>
      </div>

      {/* Workflow Tabs (Pending / History) */}
      <WorkflowTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingIndents.length}
        historyCount={historyIndents.length}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={activeData}
        searchPlaceholder="Search Indents (IND-2026-..., Department, Requested By)..."
        filterOptions={[
          { label: "Submitted", value: "SUBMITTED", key: "status" },
          { label: "Approved", value: "APPROVED", key: "status" },
          { label: "Rejected", value: "REJECTED", key: "status" },
        ]}
      />

      {/* Create Purchase Indent Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Purchase Indent Requisition"
        subtitle="Specify department requirement, priority level, and line items."
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={departments.map((d) => ({ label: d.name, value: d.id }))}
            />
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { label: "Medium Priority", value: "MEDIUM" },
                { label: "High Priority", value: "HIGH" },
                { label: "Urgent Priority", value: "URGENT" },
                { label: "Low Priority", value: "LOW" },
              ]}
            />
            <Input
              label="Required Target Date"
              type="date"
              value={requiredDate}
              onChange={(e) => setRequiredDate(e.target.value)}
            />
          </div>

          <Input
            label="Purpose of Requisition"
            placeholder="e.g. Raw material replenishment for Q3 manufacturing batch #402"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          {/* Line Items Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Material Line Items
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow}>
                + Add Material Row
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="col-span-5">
                    <Select
                      value={row.materialId}
                      onChange={(e) => handleItemChange(idx, "materialId", e.target.value)}
                      options={materials.map((m) => ({ label: `${m.code} - ${m.name}`, value: m.id }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Est. Rate (₹)"
                      value={row.estimatedRate}
                      onChange={(e) => handleItemChange(idx, "estimatedRate", e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      ₹{row.estimatedAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Input
            label="Remarks / Notes"
            placeholder="Additional specifications or special instructions"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleCreateIndent("DRAFT")} isLoading={isSubmitting}>
              Save Draft
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleCreateIndent("SUBMITTED")} isLoading={isSubmitting}>
              Submit for Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Indent Detail Modal */}
      {viewIndent && (
        <Modal
          isOpen={!!viewIndent}
          onClose={() => setViewIndent(null)}
          title={`Indent Requisition: ${viewIndent.indentNo}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <span className="text-slate-400 font-semibold block">Department:</span>
                <span className="font-bold">{viewIndent.department?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Requested By:</span>
                <span className="font-bold">{viewIndent.requestedByName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Priority:</span>
                <StatusBadge status={viewIndent.priority} />
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Status:</span>
                <StatusBadge status={viewIndent.status} />
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Purpose:</h5>
              <p className="p-2 bg-slate-100 dark:bg-slate-900 rounded">{viewIndent.purpose}</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Requested Material Line Items:</h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-semibold">
                    <tr>
                      <th className="p-2">Material</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Est. Rate</th>
                      <th className="p-2 text-right">Est. Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {viewIndent.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="p-2 font-medium">{it.material?.name}</td>
                        <td className="p-2">{it.quantity} {it.unit?.symbol || "pcs"}</td>
                        <td className="p-2">₹{it.estimatedRate}</td>
                        <td className="p-2 text-right font-bold">₹{it.estimatedAmount?.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 font-bold text-sm">
              <span>Total Estimated Amount:</span>
              <span className="text-blue-600">₹{viewIndent.totalEstimatedAmount?.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
