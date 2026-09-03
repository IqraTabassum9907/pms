"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, Mail, Bell, ChevronDown } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { UserNav } from "./user-nav";
import { useAuth } from "@/lib/auth/auth-context";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const userName = user?.name || "Al Raihan";

  return (
    <header className="sticky top-0 z-20 bg-[#f6f8fa]/90 dark:bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between gap-4 transition-colors">
      {/* Left Greeting & Mobile Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          aria-label="Toggle menu"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-tight">
            Hello, {userName} <span className="inline-block origin-bottom-right hover:rotate-12 transition-transform">👋</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Here's what's happening with your account today.
          </p>
        </div>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Messages Action Button */}
        <a
          href="/purchase/follow-up"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          title="Messages"
        >
          <Mail className="w-4 h-4" />
        </a>

        {/* Notifications */}
        <NotificationBell />

        {/* Theme switch */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          title="Toggle Theme"
        >
          <Sun className="w-4 h-4 hidden dark:block text-amber-400" />
          <Moon className="w-4 h-4 block dark:hidden text-slate-700" />
        </button>

        {/* User Navigation Pill */}
        <UserNav />
      </div>
    </header>
  );
}
