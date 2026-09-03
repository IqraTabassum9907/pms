"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/lib/auth/auth-context";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  ArrowLeftRight,
  CreditCard,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Quote,
  Users2,
  FileSpreadsheet,
  Truck,
  PhoneCall,
  PackageCheck,
  Boxes,
  RotateCcw,
  Building2,
  Package,
  Layers,
  Ruler,
  Warehouse,
  Briefcase,
  Users,
  Percent,
  Receipt,
  Clock,
  Settings,
  History,
  Lock,
  Menu,
  X,
  Sparkles,
  Activity,
  ArrowUpRight,
  Crown,
  LogOut,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon?: any;
  badge?: string | number;
  permission?: string;
}

interface NavGroup {
  groupTitle: string;
  icon: any;
  items: NavItem[];
}

const PRIMARY_MENU: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { title: "Message", href: "/purchase/follow-up", icon: MessageSquare, badge: 26, permission: "purchase:follow-up" },
  { title: "Analytics", href: "/reports/analytics", icon: BarChart2, permission: "reports:analytics" },
  { title: "Transaction", href: "/purchase/po", icon: ArrowLeftRight, permission: "purchase:po" },
  { title: "Payment", href: "/purchase/payment", icon: CreditCard, badge: 8, permission: "purchase:payment" },
];

const MANAGEMENT_GROUPS: NavGroup[] = [
  {
    groupTitle: "Procurement",
    icon: Activity,
    items: [
      { title: "Purchase Indent", href: "/purchase/indent", icon: FileText, permission: "purchase:indent" },
      { title: "Indent Approval", href: "/purchase/approval", icon: CheckCircle2, permission: "purchase:approval" },
      { title: "Quotations", href: "/purchase/quotation", icon: Quote, permission: "purchase:quotation" },
      { title: "Vendor Selection", href: "/purchase/vendor-selection", icon: Users2, permission: "purchase:vendor-selection" },
      { title: "PO Approval", href: "/purchase/po-approval", icon: CheckCircle2, permission: "purchase:po-approval" },
      { title: "PO Dispatch", href: "/purchase/po-dispatch", icon: Truck, permission: "purchase:po-dispatch" },
      { title: "Material Receipt", href: "/purchase/receipt", icon: PackageCheck, permission: "purchase:receipt" },
      { title: "Stock / Inventory", href: "/purchase/stock", icon: Boxes, permission: "purchase:stock" },
      { title: "Purchase Return", href: "/purchase/returns", icon: RotateCcw, permission: "purchase:returns" },
    ],
  },
  {
    groupTitle: "Masters",
    icon: Building2,
    items: [
      { title: "Vendors", href: "/masters/vendors", icon: Building2, permission: "masters:vendors" },
      { title: "Materials", href: "/masters/materials", icon: Package, permission: "masters:materials" },
      { title: "Categories", href: "/masters/categories", icon: Layers, permission: "masters:categories" },
      { title: "Units", href: "/masters/units", icon: Ruler, permission: "masters:units" },
      { title: "Warehouses", href: "/masters/warehouses", icon: Warehouse, permission: "masters:warehouses" },
      { title: "Departments", href: "/masters/departments", icon: Briefcase, permission: "masters:departments" },
      { title: "Employees", href: "/masters/employees", icon: Users, permission: "masters:employees" },
      { title: "Tax / GST", href: "/masters/tax", icon: Percent, permission: "masters:tax" },
      { title: "Payment Terms", href: "/masters/payment-terms", icon: Receipt, permission: "masters:payment-terms" },
      { title: "Delivery Terms", href: "/masters/delivery-terms", icon: Truck, permission: "masters:delivery-terms" },
      { title: "TAT Config", href: "/masters/tat", icon: Clock, permission: "masters:tat" },
    ],
  },
  {
    groupTitle: "Reports",
    icon: BarChart2,
    items: [
      { title: "Purchase Register", href: "/reports/purchase-register", permission: "reports:purchase-register" },
      { title: "Vendor Performance", href: "/reports/vendor-performance", permission: "reports:vendor-performance" },
      { title: "Pending Purchase", href: "/reports/pending-purchase", permission: "reports:pending-purchase" },
      { title: "PO Status Report", href: "/reports/po-status", permission: "reports:po-status" },
      { title: "Payment Report", href: "/reports/payment", permission: "reports:payment" },
      { title: "Material Receipt Report", href: "/reports/material-receipt", permission: "reports:material-receipt" },
    ],
  },
  {
    groupTitle: "Administration",
    icon: Lock,
    items: [
      { title: "Users", href: "/administration/users", icon: Users, permission: "administration:users" },
      { title: "Roles & Permissions", href: "/administration/roles", icon: Lock, permission: "administration:roles" },
      { title: "Audit Logs", href: "/administration/audit-logs", icon: History, permission: "administration:audit-logs" },
    ],
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export function Sidebar({
  isMobileOpen: externalMobileOpen,
  setIsMobileOpen: setExternalMobileOpen,
}: SidebarProps = {}) {
  const pathname = usePathname();
  const { hasPermission, logout } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Procurement: true,
    Masters: false,
    Reports: false,
    Administration: false,
  });
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const isMobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  const setIsMobileOpen = setExternalMobileOpen || setInternalMobileOpen;

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/80 px-4 py-5 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-6 px-1">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-md">
            {/* Custom geometric logo icon matching Ofspace */}
            <svg
              className="w-5 h-5 fill-current text-white"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 dark:text-white tracking-tight leading-none">
              PurchaseFlow
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-0.5">
              Enterprise PMS
            </p>
          </div>
        </Link>
        <button
          className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Menu Section */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
          Main Menu
        </p>

        {PRIMARY_MENU.map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={clsx(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150",
                isActive
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={clsx(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-white dark:text-slate-950"
                      : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"
                  )}
                />
                <span>{item.title}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950"
                      : "bg-slate-950 text-white dark:bg-slate-800 dark:text-slate-200"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Management / Workflow Section */}
      <div className="mt-6 space-y-1">
        <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
          Account Management
        </p>

        {MANAGEMENT_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.permission ? hasPermission(item.permission) : true
          );

          if (visibleItems.length === 0) return null;

          const isExpanded = expandedGroups[group.groupTitle];
          const hasActiveChild = visibleItems.some((i) => pathname === i.href);

          return (
            <div key={group.groupTitle} className="space-y-0.5">
              <button
                onClick={() => toggleGroup(group.groupTitle)}
                className={clsx(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                  hasActiveChild
                    ? "text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <group.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>{group.groupTitle}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="pl-6 pr-1 py-1 space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={clsx(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                          isActive
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        )}
                      >
                        {ItemIcon && <ItemIcon className="w-3.5 h-3.5" />}
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Setting & Logout */}
        <Link
          href="/administration/settings"
          onClick={() => setIsMobileOpen(false)}
          className={clsx(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors",
            pathname === "/administration/settings"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          )}
        >
          <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Setting</span>
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 max-w-xs h-full z-10">{navContent}</div>
        </div>
      )}

      {/* Mobile Trigger Float */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full bg-slate-950 text-white shadow-xl hover:bg-slate-800 focus:outline-none"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
