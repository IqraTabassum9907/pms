"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Search } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { UserNav } from "./user-nav";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Global Search Bar */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Global Search (Indents, POs, Vendors, Materials...)"
            className="w-full h-9 pl-9 pr-4 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Tools */}
      <div className="flex items-center space-x-3">
        {/* Dark/Light Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          <Sun className="w-5 h-5 hidden dark:block text-amber-400" />
          <Moon className="w-5 h-5 block dark:hidden text-slate-700" />
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User Navigation & Role Switcher */}
        <UserNav />
      </div>
    </header>
  );
}
