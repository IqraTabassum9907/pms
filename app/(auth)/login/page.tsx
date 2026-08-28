"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/lib/auth/types";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, Lock, KeyRound, ArrowRight } from "lucide-react";

const DEMO_CREDENTIALS = [
  { roleName: "Admin", email: "admin@purchaseflow.com", password: "Admin@123", role: "ADMIN" as UserRole },
  { roleName: "Purchase Manager", email: "manager@purchaseflow.com", password: "Manager@123", role: "PURCHASE_MANAGER" as UserRole },
  { roleName: "Purchase Executive", email: "executive@purchaseflow.com", password: "Executive@123", role: "PURCHASE_EXECUTIVE" as UserRole },
  { roleName: "Accounts User", email: "accounts@purchaseflow.com", password: "Accounts@123", role: "ACCOUNTS" as UserRole },
  { roleName: "Store Manager", email: "store@purchaseflow.com", password: "Store@123", role: "STORE_MANAGER" as UserRole },
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
      // Find matching demo credential or default to role
      const matched = DEMO_CREDENTIALS.find((c) => c.email.toLowerCase() === email.toLowerCase());
      const userRole: UserRole = matched ? matched.role : "ADMIN";

      login({
        id: `usr-${userRole.toLowerCase()}`,
        name: matched ? `${matched.roleName} User` : "Enterprise User",
        email: email,
        role: userRole,
      });

      router.push("/dashboard");
    }, 600);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600 text-white font-black text-2xl tracking-wider shadow-xl shadow-blue-600/30">
            PF
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">PurchaseFlow</h1>
          <p className="text-xs text-slate-400 font-medium">Enterprise Purchase Management System</p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="user@purchaseflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Demo Password Reset: Use one of the pre-filled credentials below.")}
                className="text-blue-400 hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full h-10 text-sm font-bold shadow-lg shadow-blue-600/30" isLoading={isLoading}>
              Sign In to PurchaseFlow <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Demo Credentials Section */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-blue-400">
                <KeyRound className="w-3.5 h-3.5" /> Demo Credentials
              </span>
              <span className="text-[10px] text-slate-500">Click to Auto Login</span>
            </div>

            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => handleQuickLogin(demo)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 transition-all text-left group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                      {demo.roleName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{demo.email}</div>
                  </div>
                  <div className="text-[10px] font-mono bg-slate-900 px-2 py-1 rounded text-slate-400 group-hover:text-white border border-slate-700">
                    {demo.password}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Powered by PurchaseFlow Enterprise • Version 2026.1
        </p>
      </div>
    </div>
  );
}
