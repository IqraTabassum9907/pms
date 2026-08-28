import React from "react";

export function TableSkeleton() {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
      <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded-md w-full" />
      <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded-md w-full" />
      <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded-md w-full" />
      <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded-md w-full" />
      <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded-md w-full" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 animate-pulse space-y-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
      <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/2" />
    </div>
  );
}
