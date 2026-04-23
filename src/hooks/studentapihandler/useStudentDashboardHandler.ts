"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface DashboardStats {
  totalOpportunities: number
  totalApplied: number
  totalRejected: number
}

interface UseStudentDashboardHandlerReturn {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  getDashboardStats: () => Promise<DashboardStats>
  clearError: () => void
}

export const useStudentDashboardHandler = (): UseStudentDashboardHandlerReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getDashboardStats = useCallback(async (): Promise<DashboardStats> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: DashboardStats }>('/api/student/dashboard/stats')
      setStats(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get dashboard stats'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    loading,
    error,
    getDashboardStats,
    clearError
  }
}


