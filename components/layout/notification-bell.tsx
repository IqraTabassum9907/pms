"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // Fallback notifications if offline
      setNotifications([
        { id: "1", title: "PO-2026-0004 awaiting approval", message: "Level 2 department approval needed.", type: "URGENT", isRead: false, linkUrl: "/purchase/po-approval", createdAt: new Date().toISOString() },
        { id: "2", title: "Payment Overdue for ABC Industrial", message: "Invoice INV-2026-0005 overdue by 5 days.", type: "WARNING", isRead: false, linkUrl: "/purchase/payment", createdAt: new Date().toISOString() },
      ]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    !item.isRead ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h5>
                    {!item.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.message}</p>

                  {item.linkUrl && (
                    <Link
                      href={item.linkUrl}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                    >
                      View Details <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">No notifications at this time.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
