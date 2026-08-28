"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/lib/auth/auth-context";
import {
  LayoutDashboard,
  ShoppingBag,
  Database,
  BarChart3,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Quote,
  Users2,
  FileSpreadsheet,
  Truck,
  PhoneCall,
  CreditCard,
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
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon?: any;
  permission?: string;
}

interface NavGroup {
  groupTitle: string;
  icon: any;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", href: "/dashboard", permission: "dashboard" },
      { title: "Purchase Analytics", href: "/reports/analytics", permission: "reports:analytics" },
    ],
  },
  {
    groupTitle: "Purchase",
    icon: ShoppingBag,
    items: [
      { title: "Purchase Indent", href: "/purchase/indent", icon: FileText, permission: "purchase:indent" },
      { title: "Indent Approval", href: "/purchase/approval", icon: CheckCircle2, permission: "purchase:approval" },
      { title: "Quotation Management", href: "/purchase/quotation", icon: Quote, permission: "purchase:quotation" },
      { title: "Vendor Selection", href: "/purchase/vendor-selection", icon: Users2, permission: "purchase:vendor-selection" },
      { title: "Purchase Order", href: "/purchase/po", icon: FileSpreadsheet, permission: "purchase:po" },
      { title: "PO Approval", href: "/purchase/po-approval", icon: CheckCircle2, permission: "purchase:po-approval" },
      { title: "PO Dispatch", href: "/purchase/po-dispatch", icon: Truck, permission: "purchase:po-dispatch" },
      { title: "Follow-Up", href: "/purchase/follow-up", icon: PhoneCall, permission: "purchase:follow-up" },
      { title: "Payment", href: "/purchase/payment", icon: CreditCard, permission: "purchase:payment" },
      { title: "Logistics", href: "/purchase/logistics", icon: Truck, permission: "purchase:logistics" },
      { title: "Material Receipt", href: "/purchase/receipt", icon: PackageCheck, permission: "purchase:receipt" },
      { title: "Stock / Inventory", href: "/purchase/stock", icon: Boxes, permission: "purchase:stock" },
      { title: "Purchase Return", href: "/purchase/returns", icon: RotateCcw, permission: "purchase:returns" },
    ],
  },
  {
    groupTitle: "Masters",
    icon: Database,
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
      { title: "TAT Configuration", href: "/masters/tat", icon: Clock, permission: "masters:tat" },
    ],
  },
  {
    groupTitle: "Reports",
    icon: BarChart3,
    items: [
      { title: "Purchase Register", href: "/reports/purchase-register", permission: "reports:purchase-register" },
      { title: "Vendor Performance", href: "/reports/vendor-performance", permission: "reports:vendor-performance" },
      { title: "Pending Purchase", href: "/reports/pending-purchase", permission: "reports:pending-purchase" },
      { title: "PO Status Report", href: "/reports/po-status", permission: "reports:po-status" },
      { title: "Payment Report", href: "/reports/payment", permission: "reports:payment" },
      { title: "Material Receipt Report", href: "/reports/material-receipt", permission: "reports:material-receipt" },
      { title: "Purchase Analytics", href: "/reports/analytics", permission: "reports:analytics" },
    ],
  },
  {
    groupTitle: "Administration",
    icon: ShieldAlert,
    items: [
      { title: "Users", href: "/administration/users", icon: Users, permission: "administration:users" },
      { title: "Roles & Permissions", href: "/administration/roles", icon: Lock, permission: "administration:roles" },
      { title: "Settings", href: "/administration/settings", icon: Settings, permission: "administration:settings" },
      { title: "Audit Logs", href: "/administration/audit-logs", icon: History, permission: "administration:audit-logs" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Dashboard: true,
    Purchase: true,
    Masters: false,
    Reports: false,
    Administration: false,
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white font-black text-lg tracking-wider shadow-md">
            PF
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">PurchaseFlow</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Enterprise PMS</p>
          </div>
        </div>
        <button
          className="lg:hidden text-slate-400 hover:text-white"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {NAV_GROUPS.map((group) => {
          // Filter items based on user permissions
          const visibleItems = group.items.filter((item) =>
            item.permission ? hasPermission(item.permission) : true
          );

          if (visibleItems.length === 0) return null;

          const isExpanded = expandedGroups[group.groupTitle];

          return (
            <div key={group.groupTitle} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.groupTitle)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <group.icon className="w-4 h-4 text-blue-400" />
                  <span>{group.groupTitle}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-0.5 pl-2">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={clsx(
                          "flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                          isActive
                            ? "bg-blue-600 text-white font-semibold shadow-xs"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        {ItemIcon && <ItemIcon className={clsx("w-3.5 h-3.5", isActive ? "text-white" : "text-slate-400")} />}
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-64 max-w-xs h-full z-10">{navContent}</div>
        </div>
      )}

      {/* Mobile Trigger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 focus:outline-none"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
