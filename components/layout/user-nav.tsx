"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const userName = user?.name || "Rahul Sharma";
  const userRole = user?.role || "ADMIN";

  // Handle click outside and Escape key to close smoothly
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-2xs focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
          <span className="font-semibold text-xs text-white">{userName.charAt(0)}</span>
        </div>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 hidden sm:inline-block truncate max-w-[140px]">
          {userName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop on mobile for instant tap-to-close */}
          <div
            className="fixed inset-0 z-40 bg-transparent sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-950 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {userName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none truncate">{userName}</p>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{user?.email || "rahul.sharma@purchaseflow.com"}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {userRole.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Quick Role Switcher */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-slate-600 dark:text-slate-400" /> Role Switcher
              </p>
              <div className="space-y-0.5 mt-1">
                {ROLES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      userRole === r.role
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{r.label}</span>
                    {userRole === r.role && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
