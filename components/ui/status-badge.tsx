import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type StatusType =
  | "DRAFT"
  | "PENDING"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "PARTIALLY_COMPLETED"
  | "COMPLETED"
  | "CANCELLED"
  | "ON_HOLD"
  | "ON_TIME"
  | "DELAYED"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE"
  | "SENT"
  | "RECEIVED"
  | "SELECTED"
  | "ACTIVE"
  | "INACTIVE"
  | "HIGH"
  | "URGENT"
  | "MEDIUM"
  | "LOW";

interface StatusBadgeProps {
  status: string | StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = String(status).toUpperCase();

  const styles: Record<string, string> = {
    // Neutral Draft
    DRAFT: "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    
    // In Review / Pending (Subtle Warm)
    PENDING: "bg-amber-50/70 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40",
    PENDING_APPROVAL: "bg-amber-50/70 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40",
    SUBMITTED: "bg-blue-50/70 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40",
    UNDER_REVIEW: "bg-indigo-50/70 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40",
    
    // Success / Completed (Subtle Sage Emerald)
    APPROVED: "bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 font-medium",
    COMPLETED: "bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 font-medium",
    PAID: "bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 font-medium",
    SELECTED: "bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 font-medium",
    ACTIVE: "bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 font-medium",
    ON_TIME: "bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 font-medium",
    
    // Active Stages (Minimal Slate/Teal)
    IN_PROGRESS: "bg-sky-50/70 text-sky-800 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/40",
    PARTIALLY_COMPLETED: "bg-teal-50/70 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/40",
    PARTIALLY_PAID: "bg-teal-50/70 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/40",
    SENT: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    RECEIVED: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    
    // Rejected / Alerts (Decent Subtle Rose)
    REJECTED: "bg-rose-50/70 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40",
    CANCELLED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    OVERDUE: "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold",
    DELAYED: "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    INACTIVE: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    
    // Priority levels (Clean)
    URGENT: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 font-medium",
    HIGH: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 font-medium",
    MEDIUM: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200",
    LOW: "bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  };

  const defaultStyle = "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  const badgeStyle = styles[norm] || defaultStyle;

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border transition-colors whitespace-nowrap",
          badgeStyle,
          className
        )
      )}
    >
      {norm.replace(/_/g, " ")}
    </span>
  );
}
