"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { History, Lock, Users, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function AdministrationPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "audit-logs";
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/audit-logs")
      .then((res) => res.json())
      .then((d) => {
        setLogs(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <TableSkeleton />;

  if (slug === "audit-logs") {
    const columns = [
      {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleString("en-IN"),
      },
      {
        accessorKey: "userName",
        header: "User Actor",
        cell: ({ row }: any) => (
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">{row.original.userName}</div>
            <div className="text-[10px] text-slate-500">{row.original.userRole}</div>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Action Performed",
        cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.action}</span>,
      },
      {
        accessorKey: "entityId",
        header: "Target Entity",
        cell: ({ row }: any) => (
          <span className="font-mono text-xs">{row.original.entity} ({row.original.entityId})</span>
        ),
      },
      {
        accessorKey: "newStatus",
        header: "New Status",
        cell: ({ row }: any) => row.original.newStatus ? <StatusBadge status={row.original.newStatus} /> : "-",
      },
      {
        accessorKey: "details",
        header: "Details / Rationale",
        cell: ({ row }: any) => <span className="text-xs italic truncate max-w-xs">{row.original.details}</span>,
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Audit Log Trail</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable audit record tracking every single status change, PO clearance, GRN entry, and payment transaction.
          </p>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          searchPlaceholder="Search audit logs (User, Action, Entity ID)..."
        />
      </div>
    );
  }

  // Users & Roles static preview
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight uppercase">Administration: {slug.replace(/-/g, " ")}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure security roles, user permissions, and system parameters.
        </p>
      </div>

      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-xs">
        <div className="flex items-center space-x-3 text-blue-600 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" /> Enterprise RBAC Policy Active
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          The system is currently running strict Role-Based Access Control across 6 enterprise roles: ADMIN, PURCHASE_MANAGER, PURCHASE_EXECUTIVE, ACCOUNTS, STORE_MANAGER, and DEPARTMENT_HEAD.
        </p>
        <Button variant="outline" size="sm" onClick={() => alert("Role parameters updated.")}>
          Update Access Policies
        </Button>
      </div>
    </div>
  );
}
