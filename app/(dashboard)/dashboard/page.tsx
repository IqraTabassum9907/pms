"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Package,
  Zap,
  Wrench,
  ShieldCheck,
  Fuel,
  MoreVertical,
  Building2,
  CreditCard,
  Truck,
  Receipt,
  Plus,
  ArrowRight,
  Wallet,
  CheckCircle2,
  Clock,
  Send,
  FileSpreadsheet,
  FileText,
  Boxes,
  Layers,
} from "lucide-react";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { useAuth } from "@/lib/auth/auth-context";

// Quick Procurement Approvers / Team
const PMS_APPROVERS = [
  { id: "1", name: "Suresh Kumar", dept: "Production", initials: "SK", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
  { id: "2", name: "Ravi Prasad", dept: "Maintenance", initials: "RP", color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  { id: "3", name: "Kavita Singh", dept: "Purchase", initials: "KS", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  { id: "4", name: "Meena Joshi", dept: "Admin", initials: "MJ", color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" },
  { id: "5", name: "Dr. Anand Rao", dept: "QC Lab", initials: "AR", color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" },
];

// Procurement Material Spending Categories
const MATERIAL_CATEGORIES = [
  { id: "1", title: "Raw Materials", subtitle: "Steel & Coils", amount: "₹9.41L", icon: Package, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400" },
  { id: "2", title: "Electrical", subtitle: "Cables & MCBs", amount: "₹9.15L", icon: Zap, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400" },
  { id: "3", title: "Mechanical", subtitle: "Bearings & Valves", amount: "₹2.12L", icon: Wrench, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" },
  { id: "4", title: "Safety & PPE", subtitle: "Helmets & Boots", amount: "₹1.00L", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" },
  { id: "5", title: "Lubricants", subtitle: "Hydraulic Oils", amount: "₹1.80L", icon: Fuel, color: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400" },
];

// Real Purchase Orders / Transactions Data
const PMS_TRANSACTIONS = [
  {
    id: "po1",
    poNo: "PO-2026-0001",
    name: "Tata Steel Limited",
    contactPerson: "Rajesh Sharma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    status: "Completed",
    date: "22 Jan, 2026",
    amount: "₹5,16,500",
    category: "Raw Materials",
  },
  {
    id: "po2",
    poNo: "PO-2026-0002",
    name: "Reliance Industries",
    contactPerson: "Priya Mehta",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    status: "In progress",
    date: "18 Jan, 2026",
    amount: "₹3,72,430",
    category: "Electrical",
  },
  {
    id: "po3",
    poNo: "PO-2026-0003",
    name: "Siemens India Ltd",
    contactPerson: "Anjali Krishnan",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    status: "Completed",
    date: "12 Jan, 2026",
    amount: "₹3,08,200",
    category: "Electrical",
  },
  {
    id: "po4",
    poNo: "PO-2026-0004",
    name: "ABB India Limited",
    contactPerson: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    status: "In progress",
    date: "08 Jan, 2026",
    amount: "₹10,05,000",
    category: "Mechanical",
  },
];

// Recent Procurement Activity Feed
const RECENT_PROCUREMENT_FEED = [
  {
    id: "rf1",
    title: "Tata Steel Advance",
    subtitle: "Bank NEFT Cleared",
    amount: "-₹1,50,000",
    isPositive: false,
    icon: Building2,
  },
  {
    id: "rf2",
    title: "Reliance Copper GRN",
    subtitle: "Goods Receipt Verified",
    amount: "+₹3,72,430",
    isPositive: true,
    icon: Truck,
  },
  {
    id: "rf3",
    title: "Siemens Invoice",
    subtitle: "Accounts Voucher Approved",
    amount: "+₹3,08,200",
    isPositive: true,
    icon: CreditCard,
  },
  {
    id: "rf4",
    title: "ABB India Dispatch",
    subtitle: "In Transit from Bengaluru",
    amount: "-₹10,05,000",
    isPositive: false,
    icon: Package,
  },
  {
    id: "rf5",
    title: "Safety Helmets Batch",
    subtitle: "Store Receipt Logged",
    amount: "-₹35,000",
    isPositive: false,
    icon: Receipt,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Newest" | "Oldest">("Newest");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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

  const triggerAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  if (loading) return <TableSkeleton />;

  const kpis = data?.kpis || {};
  const currentUserName = user?.name || "Kavita Singh";
  const userRole = user?.role ? user.role.replace(/_/g, " ") : "Purchase Manager";

  // Filter transactions
  const transactions =
    activeTab === "Newest"
      ? PMS_TRANSACTIONS
      : [...PMS_TRANSACTIONS].reverse();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Action Toast Alert */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Grid: 2 Columns on desktop (Main Workspace & Right Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT / CENTER COLUMN (Col span 8 on LG, Col span 8 or 9 on XL) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* TOP ROW: 3 Bento Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Total Procurement Spend */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Total Spend
                  </span>
                </div>
                <Link
                  href="/reports/purchase-register"
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                  title="View Purchase Register"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-5">
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  ₹ {(kpis.totalPurchaseValue ?? 4520000).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1.5 flex items-center gap-1">
                  +12.4% <span className="text-slate-400 dark:text-slate-500 font-normal">than last month</span>
                </p>
              </div>
            </div>

            {/* 2. Pending Approvals & Indents */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pending Clearance
                  </span>
                </div>
                <Link
                  href="/purchase/approval"
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                  title="View Pending Approvals"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-5">
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  ₹ {(kpis.pendingPayments ?? 1033130).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                  {kpis.pendingIndents ?? 2} Indents & {kpis.pendingPOs ?? 1} POs <span className="text-slate-400 dark:text-slate-500 font-normal">in queue</span>
                </p>
              </div>
            </div>

            {/* 3. Active POs & Inventory Inflow */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Active POs
                  </span>
                </div>
                <Link
                  href="/purchase/po"
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                  title="View Purchase Orders"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-5">
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  {kpis.approvedPOs ?? 3} Active Orders
                </h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                  {kpis.materialAwaitingReceipt ?? 2} Awaiting GRN <span className="text-slate-400 dark:text-slate-500 font-normal">receipt</span>
                </p>
              </div>
            </div>
          </div>

          {/* MIDDLE ROW: Material Categories Spending */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-950 dark:text-white tracking-tight">
                  Procurement by Category
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Material spend breakdown across active manufacturing divisions
                </p>
              </div>
              <Link
                href="/reports/analytics"
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {MATERIAL_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href="/masters/categories"
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-200 dark:hover:border-slate-700 transition-all group block"
                  >
                    <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {cat.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {cat.subtitle}
                    </p>
                    <p className="text-xs font-extrabold text-slate-950 dark:text-white mt-1.5">
                      {cat.amount}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* BOTTOM ROW: "Transactions / Purchase Orders" Clean Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            {/* Header with Title & Filter Switch */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h2 className="text-base font-bold text-slate-950 dark:text-white tracking-tight">
                  Purchase Orders & Transactions
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Latest enterprise PO logs and vendor settlement status
                </p>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("Newest")}
                  className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "Newest"
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setActiveTab("Oldest")}
                  className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "Oldest"
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Oldest
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 py-3 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-5">Vendor & Contact</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">PO Value</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3.5 px-2 grid grid-cols-1 sm:grid-cols-12 items-center gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
                >
                  {/* Vendor Name + Avatar + PO No */}
                  <div className="col-span-5 flex items-center gap-3">
                    <img
                      src={tx.avatar}
                      alt={tx.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {tx.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          ({tx.poNo})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {tx.contactPerson} • {tx.category}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="col-span-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        tx.status === "In progress"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {tx.date}
                  </div>

                  {/* Amount + 3 Dots */}
                  <div className="col-span-2 flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-xs font-bold text-slate-950 dark:text-white">
                      {tx.amount}
                    </span>
                    <Link
                      href={`/purchase/po`}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md"
                      title="View Details"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer View All Link */}
            <div className="mt-5 text-center pt-2">
              <Link
                href="/purchase/po"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                View All Purchase Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (Col span 4) — User Card, Send Again, Recent Transactions */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
            <div className="relative w-20 h-20 mx-auto mb-3.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                alt={currentUserName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-50 dark:ring-slate-800 shadow-sm"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              {currentUserName}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {userRole} • #EMP-001
            </p>

            {/* Quick Procurement Actions: New PO / Indent */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Link
                href="/purchase/po"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create PO
              </Link>
              <Link
                href="/purchase/indent"
                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> New Indent
              </Link>
            </div>
          </div>

          {/* Send Again / Quick Approvers Team */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-950 dark:text-white tracking-tight">
                  Department Approvers
                </h3>
                <p className="text-[10px] text-slate-400">Direct authorization matrix</p>
              </div>
              <Link
                href="/masters/employees"
                className="text-xs font-semibold text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              {PMS_APPROVERS.map((approver) => (
                <button
                  key={approver.id}
                  onClick={() => triggerAction(`Assigned workflow to ${approver.name} (${approver.dept})`)}
                  className="flex flex-col items-center group cursor-pointer"
                  title={`${approver.name} - ${approver.dept}`}
                >
                  <div className={`w-10 h-10 rounded-full ${approver.color} flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform`}>
                    {approver.initials}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1.5 leading-tight truncate max-w-[52px]">
                    {approver.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium leading-none truncate max-w-[52px]">
                    {approver.dept}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Procurement Activity / Vouchers */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-950 dark:text-white tracking-tight">
                  Recent Activity Logs
                </h3>
                <p className="text-[10px] text-slate-400">Payment & Material milestones</p>
              </div>
              <Link
                href="/purchase/payment"
                className="text-xs font-semibold text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              {RECENT_PROCUREMENT_FEED.map((feed) => {
                const Icon = feed.icon;
                return (
                  <div
                    key={feed.id}
                    className="flex items-center justify-between p-1.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {feed.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {feed.subtitle}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        feed.isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-950 dark:text-white"
                      }`}
                    >
                      {feed.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
