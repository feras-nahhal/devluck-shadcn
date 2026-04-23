import { useState, useCallback } from 'react'
import { api } from '../../lib/api'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  originalType?: string
  title: string
  message: string
  read: boolean
  createdAt: string
  user_id: string
}

interface ListNotificationsResponse {
  items: Notification[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface UseStudentNotificationHandlerReturn {
  notifications: Notification[]
  loading: boolean
  error: string | null
  listNotifications: (page?: number, limit?: number, read?: boolean) => Promise<ListNotificationsResponse>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearError: () => void
}

const mapBackendTypeToFrontend = (backendType: string): 'info' | 'success' | 'warning' | 'error' => {
  const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
    'WELCOME': 'info',
    'PROFILE_MILESTONE': 'info',
    'PROFILE_CREATED': 'info',
    'CONTRACT_CREATED': 'success',
    'CONTRACT_SIGNED': 'success',
    'APPLICATION_SUBMITTED': 'success',
    'PAYMENT_RECEIVED': 'success',
    'PAYMENT_CREATED': 'success',
    'REVIEW_RECEIVED': 'success',
    'CONTRACT_UPDATED': 'info',
    'PAYMENT_STATUS_UPDATED': 'info',
    'APPLICATION_STATUS_UPDATED': 'info',
    'CONTRACT_DELETED': 'warning',
    'OPPORTUNITY_DELETED': 'warning',
    'APPLICATION_WITHDRAWN': 'warning',
    'PASSWORD_CHANGED': 'warning',
    'CONTRACT_DISPUTE': 'error'
  }

  return typeMap[backendType] || 'info'
}

const mapBackendToFrontend = (backendNotification: any): Notification => {
  return {
    id: backendNotification.id,
    type: mapBackendTypeToFrontend(backendNotification.type),
    originalType: backendNotification.type,
    title: backendNotification.title,
    message: backendNotification.message,
    read: backendNotification.read,
    createdAt: backendNotification.createdAt,
    user_id: backendNotification.userId
  }
}

export const useStudentNotificationHandler = (): UseStudentNotificationHandlerReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const listNotifications = useCallback(
    async (page: number = 1, limit: number = 10, read?: boolean): Promise<ListNotificationsResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, limit }
        if (read !== undefined) {
          params.read = read.toString()
        }

        const response = await api.get<{ status: string; data: ListNotificationsResponse }>(
          '/api/student/notifications',
          { params }
        )

        const mappedItems = response.data.data.items.map(mapBackendToFrontend)
        setNotifications(mappedItems)
        return {
          ...response.data.data,
          items: mappedItems
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to list notifications'
        setError(errorMessage)
        setNotifications([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const markAsRead = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.put(`/api/student/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to mark notification as read'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllAsRead = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.put('/api/student/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to mark all notifications as read'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    notifications,
    loading,
    error,
    listNotifications,
    markAsRead,
    markAllAsRead,
    clearError
  }
}

