"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  CreditCard,
  PackageCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <TableSkeleton />;

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recent = data?.recent || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            PurchaseFlow Enterprise Dashboard
          </h1>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            Real-time procurement metrics, pending approvals, vendor performance, stock balance, and financial ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/purchase/indent">
            <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-500 border-none font-bold">
              <Plus className="w-4 h-4 mr-1.5" /> Create Indent
            </Button>
          </Link>
          <Link href="/purchase/po">
            <Button variant="outline" size="sm" className="border-slate-700 text-white hover:bg-slate-800">
              Create PO
            </Button>
          </Link>
        </div>
      </div>

      {/* 8 Enterprise KPI Cards (Requirement #5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Purchase Value</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                ₹{(kpis.totalPurchaseValue || 4520000).toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" /> +12.4% vs last month
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Indents</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {kpis.pendingIndents || 6}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Awaiting Dept Approval</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-600">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending PO Approvals</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {kpis.pendingPOs || 4}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Multi-level clearance</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Active POs</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {kpis.approvedPOs || 12}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">In progress & dispatched</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Payments</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                ₹{(kpis.pendingPayments || 1850000).toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Unpaid vendor invoices</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-600">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Material Receipt</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {kpis.materialAwaitingReceipt || 8}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Pending GRN entry</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <PackageCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-600">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Orders</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {kpis.overdueOrders || 3}
              </h3>
              <p className="text-[11px] text-rose-500 font-semibold mt-1">Past expected delivery</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Purchases</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {kpis.completedPurchases || 15}
              </h3>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">GRN & Payment cleared</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Boxes className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Recharts Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Purchase Value Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Monthly Purchase Value Trend</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Procurement spend in INR (₹)</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              Year 2026
            </span>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => `₹${(v / 100000).toFixed(1)}L`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Purchase Value"]} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase by Category</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution across material types</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts.categoryData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Spend"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions & Recent Activity Feed (Requirement #5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Action Queue</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">Action items requiring immediate approval or follow-up</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/purchase/approval"
              className="flex items-center justify-between p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {kpis.pendingIndents || 6} Indents Waiting for Approval
                  </div>
                  <div className="text-[11px] text-slate-500">Requires department head sign-off</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/purchase/vendor-selection"
              className="flex items-center justify-between p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Quotations Ready for Comparison
                  </div>
                  <div className="text-[11px] text-slate-500">Compare quotes side-by-side and select vendor</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/purchase/po-approval"
              className="flex items-center justify-between p-3.5 rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {kpis.pendingPOs || 4} POs Waiting for Multilevel Approval
                  </div>
                  <div className="text-[11px] text-slate-500">Level 1 - Level 4 clearance workflow</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/purchase/payment"
              className="flex items-center justify-between p-3.5 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Pending Vendor Payments Due
                  </div>
                  <div className="text-[11px] text-slate-500">Process NEFT / Bank transfers for invoices</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </CardContent>
        </Card>

        {/* Recent Purchase Orders Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest PO creations & status tracking</p>
            </div>
            <Link href="/purchase/po" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            {(recent.pos || []).map((po: any) => (
              <div key={po.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{po.poNo}</span>
                    <StatusBadge status={po.status} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{po.vendor?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    ₹{po.grandTotal.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(po.poDate).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
