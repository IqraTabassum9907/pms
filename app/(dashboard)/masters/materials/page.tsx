"use client";

import React, { useEffect, useState } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function MaterialMasterPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [estimatedRate, setEstimatedRate] = useState("150");
  const [reorderLevel, setReorderLevel] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/masters");
      const data = await res.json();
      setMaterials(data.materials || []);
      setCategories(data.categories || []);
      setUnits(data.units || []);

      if (data.categories?.length) setCategoryId(data.categories[0].id);
      if (data.units?.length) setUnitId(data.units[0].id);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleCreateMaterial = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "materials",
          data: {
            name,
            categoryId,
            unitId,
            estimatedRate,
            reorderLevel,
          },
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        fetchMaterials();
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const columns = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Material Name",
      cell: ({ row }: any) => <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.name}</span>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => row.original.category?.name || "N/A",
    },
    {
      accessorKey: "estimatedRate",
      header: "Std. Rate",
      cell: ({ row }: any) => `₹${row.original.estimatedRate}`,
    },
    {
      accessorKey: "reorderLevel",
      header: "Reorder Level",
      cell: ({ row }: any) => `${row.original.reorderLevel} ${row.original.unit?.symbol || "pcs"}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status || "ACTIVE"} />,
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Material Master Catalog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain item codes, standard unit rates, tax classification, and minimum reorder thresholds.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add Material Item
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={materials}
        searchPlaceholder="Search materials (Code, Name, Category)..."
      />

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Material SKU Catalog Item"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <Input label="Material Name" value={name} onChange={(e) => setName(e.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
            <Select
              label="Unit of Measure"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              options={units.map((u) => ({ label: `${u.name} (${u.symbol})`, value: u.id }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Standard Estimated Rate (₹)" type="number" value={estimatedRate} onChange={(e) => setEstimatedRate(e.target.value)} />
            <Input label="Minimum Reorder Threshold Qty" type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateMaterial} isLoading={isSubmitting} className="font-bold">
              Save Material
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
