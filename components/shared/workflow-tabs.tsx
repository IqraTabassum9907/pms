"use client";

import React from "react";
import { clsx } from "clsx";
import { Clock, History as HistoryIcon } from "lucide-react";

interface WorkflowTabsProps {
  activeTab: "pending" | "history";
  onTabChange: (tab: "pending" | "history") => void;
  pendingCount?: number;
  historyCount?: number;
}

export function WorkflowTabs({
  activeTab,
  onTabChange,
  pendingCount,
  historyCount,
}: WorkflowTabsProps) {
  return (
    <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
      <button
        onClick={() => onTabChange("pending")}
        className={clsx(
          "flex items-center space-x-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all shrink-0 cursor-pointer",
          activeTab === "pending"
            ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100 font-semibold"
            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        )}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Pending Actions</span>
        {pendingCount !== undefined && (
          <span
            className={clsx(
              "ml-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full",
              activeTab === "pending"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            {pendingCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange("history")}
        className={clsx(
          "flex items-center space-x-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all shrink-0 cursor-pointer",
          activeTab === "history"
            ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100 font-semibold"
            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        )}
      >
        <HistoryIcon className="w-3.5 h-3.5" />
        <span>Completed History</span>
        {historyCount !== undefined && (
          <span
            className={clsx(
              "ml-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full",
              activeTab === "history"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            {historyCount}
          </span>
        )}
      </button>
    </div>
  );
}
