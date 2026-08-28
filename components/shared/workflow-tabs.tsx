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
    <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 mb-4">
      <button
        onClick={() => onTabChange("pending")}
        className={clsx(
          "flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer",
          activeTab === "pending"
            ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        )}
      >
        <Clock className="w-4 h-4" />
        <span>Pending Actions</span>
        {pendingCount !== undefined && (
          <span
            className={clsx(
              "ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full",
              activeTab === "pending"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
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
          "flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer",
          activeTab === "history"
            ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        )}
      >
        <HistoryIcon className="w-4 h-4" />
        <span>Completed History</span>
        {historyCount !== undefined && (
          <span
            className={clsx(
              "ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full",
              activeTab === "history"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
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
