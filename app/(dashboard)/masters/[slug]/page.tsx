"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

const SLUG_TITLES: Record<string, { title: string; subtitle: string; entity: string }> = {
  categories: { title: "Material Categories Master", subtitle: "Define material grouping and classification hierarchy.", entity: "categories" },
  units: { title: "Units of Measure (UOM) Master", subtitle: "Standard physical unit measurements (kg, pcs, m, box).", entity: "units" },
  warehouses: { title: "Warehouse & Plant Facilities", subtitle: "Storage locations, plant addresses, and facility managers.", entity: "warehouses" },
  departments: { title: "Department Directory", subtitle: "Company organizational departments and budget heads.", entity: "departments" },
  employees: { title: "Employee & Personnel Roster", subtitle: "Internal staff members and procurement roles.", entity: "employees" },
  tax: { title: "Tax & GST Configuration", subtitle: "Standard Indian GST tax rates (CGST, SGST, IGST).", entity: "tax" },
  "payment-terms": { title: "Payment Terms Master", subtitle: "Commercial payment credit terms (Net 30, Net 45, Advance).", entity: "payment-terms" },
  "delivery-terms": { title: "Delivery & Freight Terms", subtitle: "Shipping terms (FOR Destination, Ex-Works, FOB).", entity: "delivery-terms" },
  tat: { title: "Turnaround Time (TAT) Rules Engine", subtitle: "Configurable workflow target SLAs and delay alert rules.", entity: "tat" },
};

export default function GenericMasterPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "categories";
  const masterInfo = SLUG_TITLES[slug] || SLUG_TITLES.categories;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/masters?entity=${masterInfo.entity}`)
      .then((res) => res.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [masterInfo.entity]);

  if (loading) return <TableSkeleton />;

  const columns = [
    {
      accessorKey: "code",
      header: "Code / Key",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.code || row.original.stageKey || row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: "Name / Title",
      cell: ({ row }: any) => <span className="font-bold">{row.original.name || row.original.stageName}</span>,
    },
    {
      accessorKey: "description",
      header: "Description / Details",
      cell: ({ row }: any) =>
        row.original.description ||
        row.original.location ||
        row.original.days ? `Days: ${row.original.days}` : "Standard Record",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{masterInfo.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{masterInfo.subtitle}</p>
        </div>
        <Button onClick={() => alert("Master entry creation form.")} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add Entry
        </Button>
      </div>

      <DataTable columns={columns} data={data} searchPlaceholder={`Search ${masterInfo.title}...`} />
    </div>
  );
}
