"use client"

import { useEffect, useState } from "react"
import { useStudentNotificationHandler } from "./useStudentNotificationHandler"
import { usePathname } from "next/navigation"



export const useUnreadNotifications = () => {
  const pathname = usePathname()

  const isStudentRoute = pathname.startsWith("/Student")

  const { notifications, listNotifications } = useStudentNotificationHandler()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isStudentRoute) return   // ⬅️ IMPORTANT

    const fetchNotifications = async () => {
      try {
        await listNotifications(1, 10, false)
      } catch {}
    }

    fetchNotifications()
  }, [isStudentRoute, listNotifications])

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  return {
    unreadCount,
    unreadLabel: unreadCount > 9 ? "9+" : unreadCount.toString()
  }
}

