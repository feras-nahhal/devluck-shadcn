"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useCompanyNotificationHandler } from "./useCompanyNotificationHandler"

export const useUnreadNotifications = () => {
  const pathname = usePathname()
  const isCompanyRoute = pathname.startsWith("/Company")

  const { notifications, listNotifications } = useCompanyNotificationHandler()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isCompanyRoute) return   // ⬅️ IMPORTANT GUARD

    const fetchNotifications = async () => {
      try {
        await listNotifications(1, 10, false)
      } catch (err) {
        console.error("Failed to fetch company notifications", err)
      }
    }

    fetchNotifications()
  }, [isCompanyRoute, listNotifications])

  useEffect(() => {
    if (!isCompanyRoute) {
      setUnreadCount(0)
      return
    }

    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications, isCompanyRoute])

  const unreadLabel = unreadCount > 9 ? "9+" : unreadCount.toString()

  return { unreadCount, unreadLabel }
}
