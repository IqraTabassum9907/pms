"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/lib/auth/auth-context";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa] dark:bg-slate-950 text-slate-900 dark:text-white p-6">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f8fa] dark:bg-slate-950">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-3 sm:p-6 lg:p-7 w-full space-y-4 sm:space-y-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
