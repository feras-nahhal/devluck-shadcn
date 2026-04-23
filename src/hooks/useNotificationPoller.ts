"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
}

interface UseNotificationPollerProps {
  fetchNotifications: () => Promise<Notification[]>
  onNewNotification: (notification: Notification) => void
  interval?: number
  enabled?: boolean
}

export const useNotificationPoller = ({
  fetchNotifications,
  onNewNotification,
  interval = 30000,
  enabled = true
}: UseNotificationPollerProps) => {
  const [isPolling, setIsPolling] = useState(false)
  const lastSeenIdRef = useRef<string | null>(null)
  const isFirstLoadRef = useRef(true)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkForNewNotifications = useCallback(async () => {
    if (!enabled) return

    try {
      setIsPolling(true)
      const notifications = await fetchNotifications()

      if (!notifications || notifications.length === 0) {
        setIsPolling(false)
        return
      }

      const latestNotification = notifications[0]
      const latestId = latestNotification.id

      if (isFirstLoadRef.current) {
        lastSeenIdRef.current = latestId
        isFirstLoadRef.current = false
        setIsPolling(false)
        return
      }

      if (lastSeenIdRef.current === null) {
        lastSeenIdRef.current = latestId
        setIsPolling(false)
        return
      }

      const newNotifications: Notification[] = []
      for (const notification of notifications) {
        if (notification.id === lastSeenIdRef.current) {
          break
        }
        newNotifications.push(notification)
      }

      if (newNotifications.length > 0) {
        newNotifications.reverse().forEach(notification => {
          onNewNotification(notification)
        })
        lastSeenIdRef.current = latestId
      }

      setIsPolling(false)
    } catch (error) {
      console.error('Notification polling error:', error)
      setIsPolling(false)
    }
  }, [fetchNotifications, onNewNotification, enabled])

  useEffect(() => {
    if (!enabled) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      return
    }

    checkForNewNotifications()

    pollIntervalRef.current = setInterval(checkForNewNotifications, interval)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [checkForNewNotifications, interval, enabled])

  const resetPoller = useCallback(() => {
    isFirstLoadRef.current = true
    lastSeenIdRef.current = null
  }, [])

  return {
    isPolling,
    resetPoller
  }
}

