"use client";
import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";
interface NotificationsCardProps {
  id: string;
  title: string;
  type: string;
  message: string;
  read: boolean;
  createdAt?: string;
  user_id: string;
  onOpenPopup: (notification: {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt?: string;
    user_id: string;
  }) => void;
}

export default function NotificationsCard({
  id,
  title,
  message,
  read,
  type,
  createdAt,
  user_id,
  onOpenPopup,
}: NotificationsCardProps) {
  const truncateId = (userId: string, maxLength = 8) => {
    if (!userId) return "Unknown";
    return userId.length > maxLength ? `${userId.slice(0, maxLength)}...` : userId;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenPopup({
      id,
      title,
      message,
      read,
      createdAt,
      user_id,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const typeStyles: Record<
    string,
    { icon: React.ElementType; bgColor: string; iconColor: string }
  > = {
    info: { icon: Info, bgColor: "bg-blue-100", iconColor: "text-blue-500" },
    success: { icon: CheckCircle, bgColor: "bg-green-100", iconColor: "text-green-500" },
    warning: { icon: AlertTriangle, bgColor: "bg-yellow-100", iconColor: "text-yellow-500" },
    error: { icon: XCircle, bgColor: "bg-red-100", iconColor: "text-red-500" },
  };

  {/* ✅ Notification Icon */}
  const { icon: TypeIcon, bgColor, iconColor } = typeStyles[type] || typeStyles.info;

  const typeTextColor: Record<string, string> = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  };

  const iconMotion: Record<string, string> = {
    info: "animate-pulse",
    success: "animate-bounce",
    warning: "animate-ping",
    error: "animate-pulse",
  };

  const typeBgColor: Record<string, string> = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };


  return (
    <div
      onClick={handleCardClick}
      className="
        w-[99%] cursor-pointer rounded-xl 
        transition-all duration-200 ease-out
        hover:bg-gray-50 dark:hover:bg-[var(--color-border)]
        hover:scale-[1.01]
        hover:shadow-sm
      "
    >
      <div
        className="relative flex flex-row items-center justify-between w-full"
        style={{
          height: "76px",
          padding: "16px",
          gap: "24px",
          borderBottom: "1px dashed rgba(145,158,171,0.2)",
          background: "transparent", // Transparent background
          boxSizing: "border-box",
        }}
      >

      {/* ✅ Notification Icon */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center shrink-0
          ${bgColor}
          ${!read ? iconMotion[type] || "" : ""}
        `}
      >
        <TypeIcon className={`w-5 h-5 ${iconColor}`} />
      </div>



        {/* ✅ Main Content */}
        <div className="flex flex-row items-center justify-between flex-1 min-w-0">
          {/* Left side (title + info) */}
          <div className="flex flex-col items-start gap-1 min-w-0">
            <span
              className={`text-sm truncate ${
                read ? "text-[var(--color-text-secondary)] font-medium" : "text-[var(--color-text-primary)] font-bold"
              }`}
            >
              {title || "No title"}
            </span>


            <span className="text-xs text-[var(--color-text-secondary)] flex items-center">
              <span>{formatDate(createdAt)}</span>
              <span className="mx-1">•</span>
                <span
                  className={`
                    capitalize font-medium
                    ${typeTextColor[type] || "text-[var(--color-text-secondary)]"}
                    ${!read ? "animate-unread" : ""}
                    ${type === "warning" && !read ? "animate-warning" : ""}
                  `}
                >
                  {type}
                </span>
            </span>
          </div>

          {/* ✅ Colored dot at end if unread */}
          {!read && (
            <div
              className={`w-2.5 h-2.5 rounded-full mr-2 unread-dot ${
                typeBgColor[type] || "bg-gray-400"
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
 