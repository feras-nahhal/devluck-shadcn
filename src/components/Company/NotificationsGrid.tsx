"use client";
import { useState, useEffect, useMemo } from "react";
import NotificationsCard from "./NotificationsCard";
import type { Notification } from "../../hooks/companyapihandler/useCompanyNotificationHandler";
import { useCompanyNotificationHandler } from "../../hooks/companyapihandler/useCompanyNotificationHandler";
import { createPortal } from "react-dom";
import NotificationsCardSkeleton from "./NotificationsCardSkeleton";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

 
export default function NotificationsGrid() {
  const {
    notifications,
    loading,
    error,
    listNotifications,
    markAsRead: markAsReadAPI,
    markAllAsRead: markAllAsReadAPI,
    clearError
  } = useCompanyNotificationHandler();

  useEffect(() => {
    listNotifications(1, 100).catch((err) => {
      console.error('Failed to load notifications:', err);
    });
  }, [listNotifications]);

  const [selectedReadStatus, setSelectedReadStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Popup state (for card click)
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  /** 🧠 Client-side filtering (by read status only – top labels) */
  const filteredData = useMemo(() => {
    let filtered = notifications || [];

    // Filter by selected read status ("" = all)
    if (selectedReadStatus === "read") {
      filtered = filtered.filter((item) => item.read === true);
    } else if (selectedReadStatus === "unread") {
      filtered = filtered.filter((item) => item.read === false);
    }

    return filtered;
  }, [notifications, selectedReadStatus]);

  /** Counts for stats (from full notifications – accurate even if filtered) */
  const totalCount = notifications.length;
  const readCount = notifications.filter((n) => n.read === true).length;
  const unreadCount = notifications.filter((n) => n.read === false).length;



  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedReadStatus]);

  /** Popup handlers (card click opens modal) */
  // ✅ FIXED
  const handleOpenPopup = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsPopupOpen(true);
  };

  const handleMarkAsReadInPopup = async () => {
    if (!selectedNotification?.id) return;

    try {
      await markAsReadAPI(selectedNotification.id);
      setIsPopupOpen(false);
      setSelectedNotification(null);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };


  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedNotification(null);
  };

  const typeTextColor: Record<string, string> = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  };
  


  // Escape key close for popup
  useEffect(() => {
    if (!isPopupOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClosePopup();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isPopupOpen]);

/** Loading/Error States */
  if (loading)
    return (
     <div
        className="flex flex-col items-center justify-start mx-auto w-full max-w-[75rem] px-2 sm:px-2 md:px-2 py-1 bg-[var(--color-card)] shadow-[0_4px_12px_rgba(145,158,171,0.3),0_0_4px_rgba(145,158,171,0.2)]"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div className="w-full max-w-[74rem] h-[56px] bg-gray-100 dark:bg-[rgba(255,255,255,0.05)] rounded-xl flex items-center justify-between px-2 mb-2 mt-1 gap-2"> {/* Responsive inner width */}
          {[{ label: "All" }, { label: "Unread" }, { label: "Archived" }].map(
            (item) => (
              <div
                key={item.label}
                className="flex-1 h-[40px] rounded-xl bg-white/[0.08] dark:bg-[var(--color-border)] animate-pulse"
              />
            )
          )}
        </div>

        {/* Skeleton notification cards */}
        <div className="flex flex-col w-full items-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <NotificationsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center py-10 text-[var(--color-text-primary)]">
        Error: {error}
      </div>
    );

  if (!notifications || notifications.length === 0)
    return (
      <div className="flex justify-center py-10 text-[var(--color-text-primary)]">
        No notifications available.
      </div>
    );

  /** Render UI */
  return (
    <>
     <div
        className="flex flex-col items-center justify-start mx-auto w-full max-w-[75rem] px-2 sm:px-2 md:px-2 py-1 bg-[var(--color-card)] shadow-[0_4px_12px_rgba(145,158,171,0.3),0_0_4px_rgba(145,158,171,0.2)]"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >

      {/* 🧠 Stats Summary Box */}
      <div className="w-full max-w-[74rem] h-[56px] bg-gray-100 dark:bg-[rgba(255,255,255,0.05)] rounded-xl flex items-center justify-between px-2 mb-2 mt-1 gap-2">
        {[
          { label: "All", status: "", color: "#9CA3AF", count: totalCount },
          { label: "Unread", status: "unread", color: "rgba(0, 184, 217, 0.85)", count: unreadCount }, // Blue for unread
          { label: "Archived", status: "read", color: "rgba(34, 197, 94, 0.85)", count: readCount },   // Green for read
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setSelectedReadStatus(item.status)}
            className={`flex-1 h-[40px] flex items-center justify-center gap-2 rounded-lg transition-all duration-200
              ${
                selectedReadStatus === item.status
                  ? "bg-white dark:bg-[var(--color-border)] text-gray-900 dark:text-[var(--color-text-primary)] shadow-sm"
                  : "bg-transparent text-gray-500 dark:text-[var(--color-text-secondary)] hover:bg-white dark:hover:bg-[var(--color-border)] hover:text-gray-900 dark:hover:text-[var(--color-text-primary)]"
              }`}
          >
            <span className="text-sm text-[var(--color-text-primary)] font-medium">{item.label}</span>
            <div
              className="w-6 h-6 flex items-center justify-center rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: item.color }}
            >
              {item.count}
            </div>
          </button>
        ))}
      </div>


        {/* Cards Container (max 6 visible + frosted scrollbar) */}
        <div className="notifications-scroll flex flex-col w-full items-center overflow-y-auto custom-scrollbar">
          {filteredData.length === 0 ? (
            <p className="text-[var(--color-text-secondary)] py-10 text-center text-sm">
              No notifications found for &quot;{selectedReadStatus || "All"}&quot; status.
            </p>
          ) : (
            filteredData.map((notification) => (
              <NotificationsCard
                key={notification.id}
                type={notification.type}
                id={notification.id}
                title={notification.title}
                message={notification.message}
                read={notification.read}
                createdAt={notification.createdAt}
                user_id={notification.user_id}
                onOpenPopup={() => handleOpenPopup(notification)}
              />
            ))
          )}
        </div>

        <style jsx>{`
          /* Notifications Scroll Container */
          .notifications-scroll {
            max-height: calc(6 * 76px);
            padding-right: 6px;
            scroll-behavior: smooth;
            overflow-y: auto;
          }

          /* ===== Transparent Scrollbar ===== */

          /* Firefox */
          .notifications-scroll {
            scrollbar-width: thin;
            background-color: transparent; /* invisible normally */
          }

          /* Chrome / Edge / Safari */
          .notifications-scroll::-webkit-scrollbar {
            width: 2px;
            height: 4px;
          }

          .notifications-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .notifications-scroll::-webkit-scrollbar-thumb {
            background-color: transparent; /* invisible normally */
            border-radius: 9999px;
            transition: background 0.3s ease;
          }

          .notifications-scroll::-webkit-scrollbar-thumb:hover {
            background-color: rgba(199, 196, 196, 0.3); /* slightly visible on hover */
          }
        `}</style>

      </div>

      {/* NEW: Enhanced Popup Modal */}
      <Dialog open={isPopupOpen} onOpenChange={handleClosePopup}>
            <DialogContent
              className="
                w-[95vw] sm:w-full
                max-w-xl
                max-h-[85vh]
                overflow-y-auto

                p-4 sm:p-6
                rounded-xl
              "
            >

              {/* HEADER */}
              <DialogHeader className="flex flex-row items-start justify-between gap-4">
                <DialogTitle className="text-lg sm:text-xl font-bold">
                  {selectedNotification?.title || "No Title"}
                </DialogTitle>
              </DialogHeader>

              {/* META */}
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div>
                  Type:{" "}
                  <span className="font-semibold text-foreground">
                    {selectedNotification?.type || "N/A"}
                  </span>
                </div>

                <div>
                  Date:{" "}
                  <span className="font-semibold text-foreground">
                    {selectedNotification?.createdAt
                      ? new Date(selectedNotification.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>

                {selectedNotification?.read && (
                  <span className="text-green-600 font-semibold">
                    ✓ Already read
                  </span>
                )}
              </div>

              {/* MESSAGE */}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold">Message</p>

                <div className="text-sm text-muted-foreground whitespace-pre-wrap border rounded-md p-3 bg-muted/40">
                  {selectedNotification?.message || "No message available."}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">

                {!selectedNotification?.read && (
                  <Button
                    onClick={handleMarkAsReadInPopup}
                    disabled={loading}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Check className="h-4 w-4" />
                    {loading ? "Loading..." : "Mark as Read"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleClosePopup}
                  className="gap-2 w-full sm:w-auto"
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>

              </div>

            </DialogContent>
          </Dialog>

    </>
  );
}
