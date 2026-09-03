"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/lib/auth/types";
import { useRouter } from "next/navigation";
import { Mail, Lock, KeyRound, ArrowRight } from "lucide-react";

const DEMO_CREDENTIALS = [
  { roleName: "Admin", email: "admin@purchaseflow.com", password: "Admin@123", role: "ADMIN" as UserRole, badge: "Full Access" },
  { roleName: "Purchase Manager", email: "manager@purchaseflow.com", password: "Manager@123", role: "PURCHASE_MANAGER" as UserRole, badge: "Approvals" },
  { roleName: "Purchase Executive", email: "executive@purchaseflow.com", password: "Executive@123", role: "PURCHASE_EXECUTIVE" as UserRole, badge: "Indent & PO" },
  { roleName: "Accounts User", email: "accounts@purchaseflow.com", password: "Accounts@123", role: "ACCOUNTS" as UserRole, badge: "Payments" },
  { roleName: "Store Manager", email: "store@purchaseflow.com", password: "Store@123", role: "STORE_MANAGER" as UserRole, badge: "Inventory" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("admin@purchaseflow.com");
  const [password, setPassword] = useState("Admin@123");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const matched = DEMO_CREDENTIALS.find((c) => c.email.toLowerCase() === email.toLowerCase());
      const userRole: UserRole = matched ? matched.role : "ADMIN";

      login({
        id: `usr-${userRole.toLowerCase()}`,
        name: matched ? `${matched.roleName} User` : "Enterprise User",
        email: email,
        role: userRole,
      });

      router.push("/dashboard");
    }, 400);
  };

  const handleQuickLogin = (demo: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    login({
      id: `usr-${demo.role.toLowerCase()}`,
      name: `${demo.roleName} User`,
      email: demo.email,
      role: demo.role,
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f6f8fa] dark:bg-slate-950 p-4 transition-colors select-none">
      <div className="w-full max-w-[380px] space-y-4 animate-in fade-in duration-300">
        {/* Compact Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-950 text-white shadow-sm">
            <svg
              className="w-4 h-4 fill-current text-white"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" />
            </svg>
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            PurchaseFlow
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            Enterprise Purchase Management System
          </p>
        </div>

        {/* Compact Minimal White Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Work Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="user@purchaseflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-950 dark:focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-950 dark:focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <label className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-950 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Quick Login: Click any role credential below to sign in instantly.")}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors text-[11px]"
              >
                Forgot password?
              </button>
            </div>

            {/* Compact Black Solid Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 mt-1"
            >
              {isLoading ? "Signing in..." : "Sign In to PurchaseFlow"}
              {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Compact Demo Credentials */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <KeyRound className="w-3 h-3 text-slate-400" /> Demo Credentials
              </span>
              <span className="text-[9px] text-slate-400 lowercase font-normal">click to login</span>
            </div>

            <div className="space-y-1">
              {DEMO_CREDENTIALS.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => handleQuickLogin(demo)}
                  className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {demo.roleName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white">
                        {demo.roleName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    {demo.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-[10px] text-slate-400 font-medium">
          PurchaseFlow Enterprise • Version 2026.1
        </p>
      </div>
    </div>
  );
}
