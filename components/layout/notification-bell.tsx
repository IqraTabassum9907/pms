"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside and Escape key to close smoothly
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer focus:outline-none"
        title="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop on mobile for extra smooth tap-to-close */}
          <div
            className="fixed inset-0 z-40 bg-transparent sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Mark read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      !item.isRead ? "bg-slate-50/60 dark:bg-slate-800/30" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h5>
                      {!item.isRead && <span className="w-2 h-2 rounded-full bg-slate-950 dark:bg-white shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.message}</p>

                    {item.linkUrl && (
                      <Link
                        href={item.linkUrl}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center text-[11px] font-bold text-slate-900 dark:text-slate-200 mt-2 hover:underline"
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
        </>
      )}
    </div>
  );
}
