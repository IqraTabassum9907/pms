"use client";

import React, { useEffect, useState } from "react";
import { Boxes, AlertTriangle, ArrowUpRight, ArrowDownRight, History, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function StockInventoryPage() {
  const [stockData, setStockData] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "movements">("inventory");

  useEffect(() => {
    fetch("/api/stock")
      .then((res) => res.json())
      .then((d) => {
        setStockData(d.stock || []);
        setMovements(d.movements || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const stockColumns = [
    {
      accessorKey: "sku",
      header: "SKU / Material",
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.original.material?.name}</div>
          <div className="text-[10px] text-slate-500 font-mono">{row.original.sku} • {row.original.material?.category?.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "warehouse",
      header: "Warehouse",
      cell: ({ row }: any) => row.original.warehouse?.name || "Central Warehouse",
    },
    {
      accessorKey: "openingStock",
      header: "Opening",
      cell: ({ row }: any) => `${row.original.openingStock} ${row.original.unit?.symbol || "pcs"}`,
    },
    {
      accessorKey: "receivedStock",
      header: "Received",
      cell: ({ row }: any) => <span className="text-emerald-600 font-bold">+{row.original.receivedStock}</span>,
    },
    {
      accessorKey: "issuedStock",
      header: "Issued",
      cell: ({ row }: any) => <span className="text-rose-600 font-bold">-{row.original.issuedStock}</span>,
    },
    {
      accessorKey: "availableStock",
      header: "Available Stock",
      cell: ({ row }: any) => {
        const isReorder = row.original.availableStock <= row.original.reorderLevel;
        return (
          <div className="flex items-center space-x-2">
            <span className={`font-black text-sm ${isReorder ? "text-rose-600" : "text-slate-900 dark:text-slate-100"}`}>
              {row.original.availableStock} {row.original.unit?.symbol || "pcs"}
            </span>
            {isReorder && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-0.5" /> Reorder Alert
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "reorderLevel",
      header: "Reorder Level",
      cell: ({ row }: any) => `${row.original.reorderLevel} ${row.original.unit?.symbol || "pcs"}`,
    },
  ];

  const movementColumns = [
    {
      accessorKey: "movementDate",
      header: "Timestamp",
      cell: ({ row }: any) => new Date(row.original.movementDate).toLocaleString("en-IN"),
    },
    {
      accessorKey: "referenceNo",
      header: "Reference No",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.referenceNo}</span>,
    },
    {
      accessorKey: "movementType",
      header: "Movement Type",
      cell: ({ row }: any) => <StatusBadge status={row.original.movementType} />,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }: any) => (
        <span className={row.original.movementType.includes("INBOUND") ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
          {row.original.movementType.includes("INBOUND") ? `+${row.original.quantity}` : `-${row.original.quantity}`}
        </span>
      ),
    },
    {
      accessorKey: "createdByName",
      header: "Executed By",
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock & Warehouse Inventory Engine</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time stock balance formula: Available Stock = Opening + Received - Issued - Reserved.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Button
          variant={activeTab === "inventory" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("inventory")}
        >
          <Boxes className="w-4 h-4 mr-1.5" /> Stock Inventory Balance
        </Button>
        <Button
          variant={activeTab === "movements" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("movements")}
        >
          <History className="w-4 h-4 mr-1.5" /> Stock Movement Logs
        </Button>
      </div>

      {activeTab === "inventory" ? (
        <DataTable
          columns={stockColumns}
          data={stockData}
          searchPlaceholder="Search material stock (Name, SKU, Category)..."
        />
      ) : (
        <DataTable
          columns={movementColumns}
          data={movements}
          searchPlaceholder="Search stock movement logs..."
        />
      )}
    </div>
  );
}
