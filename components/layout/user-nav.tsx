"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/lib/auth/types";
import { LogOut, UserCheck, ChevronDown, Shield } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const ROLES: { label: string; role: UserRole }[] = [
  { label: "Admin", role: "ADMIN" },
  { label: "Purchase Manager", role: "PURCHASE_MANAGER" },
  { label: "Purchase Executive", role: "PURCHASE_EXECUTIVE" },
  { label: "Accounts User", role: "ACCOUNTS" },
  { label: "Store Manager", role: "STORE_MANAGER" },
  { label: "Department Head", role: "DEPARTMENT_HEAD" },
];

export function UserNav() {
  const { user, logout, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-800"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
          {user.name.charAt(0)}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
            {user.name.split(" ")[0]}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase">{user.role.replace(/_/g, " ")}</div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
            <div className="mt-2">
              <StatusBadge status={user.role} />
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-500" /> Quick Role Switcher
            </p>
            <div className="space-y-0.5 mt-1">
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    user.role === r.role
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{r.label}</span>
                  {user.role === r.role && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
