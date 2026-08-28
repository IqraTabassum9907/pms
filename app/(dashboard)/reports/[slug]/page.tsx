"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BarChart3, Download, Printer, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

const REPORT_TITLES: Record<string, { title: string; subtitle: string }> = {
  "purchase-register": { title: "Purchase Register Report", subtitle: "Comprehensive log of all purchase orders, values, tax split, and vendor ledgers." },
  "vendor-performance": { title: "Vendor Performance Analytics", subtitle: "Supplier ratings, delivery compliance rate, quality acceptance, and pricing trends." },
  "pending-purchase": { title: "Pending Purchase Orders Report", subtitle: "Orders awaiting multi-level approval, vendor dispatch, or material receipt." },
  "po-status": { title: "PO Status & Lifecycle Report", subtitle: "End-to-end status tracking from Indent to GRN completion." },
  payment: { title: "Payment Ledger Report", subtitle: "Vendor invoices, paid amounts, outstanding balances, and due dates." },
  "material-receipt": { title: "Material Receipt (GRN) Summary", subtitle: "Inbound warehouse receipts, inspected quantities, and damaged returns." },
  analytics: { title: "Executive Purchase Analytics", subtitle: "High-level spend breakdown by category, department, and monthly trend." },
};

export default function ReportsPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "purchase-register";
  const reportInfo = REPORT_TITLES[slug] || REPORT_TITLES["purchase-register"];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/pos")
      .then((res) => res.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <TableSkeleton />;

  const columns = [
    {
      accessorKey: "poNo",
      header: "PO Reference",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.poNo}</span>,
    },
    {
      accessorKey: "poDate",
      header: "PO Date",
      cell: ({ row }: any) => new Date(row.original.poDate).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "vendor",
      header: "Vendor Name",
      cell: ({ row }: any) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }: any) => row.original.department?.name || "N/A",
    },
    {
      accessorKey: "gstAmount",
      header: "GST Tax (₹)",
      cell: ({ row }: any) => `₹${Number(row.original.gstAmount || 0).toLocaleString("en-IN")}`,
    },
    {
      accessorKey: "grandTotal",
      header: "Grand Total (₹)",
      cell: ({ row }: any) => (
        <span className="font-bold">₹{Number(row.original.grandTotal || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{reportInfo.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{reportInfo.subtitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1.5" /> Print Report
          </Button>
          <Button variant="primary" size="sm" onClick={() => alert("Downloading Excel/CSV export...")} className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Export Excel / CSV
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder={`Search ${reportInfo.title}...`}
      />
    </div>
  );
}
