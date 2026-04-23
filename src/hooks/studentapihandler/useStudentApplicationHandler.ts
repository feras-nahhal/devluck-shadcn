"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface Application {
  id: string
  studentId: string
  opportunityId: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  assessmentStatus?: 'not_started' | 'generating' | 'in_progress' | 'submitted' | 'evaluating' | 'completed' | 'failed'
  appliedAt: string
  withdrawnAt?: string
  opportunity?: any
}

interface ListApplicationsResponse {
  items: Application[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface UseStudentApplicationHandlerReturn {
  applications: Application[]
  application: Application | null
  loading: boolean
  error: string | null
  getApplications: (page?: number, pageSize?: number, status?: string) => Promise<ListApplicationsResponse>
  getApplication: (id: string) => Promise<Application>
  checkApplicationExists: (opportunityId: string) => Promise<boolean>
  createApplication: (opportunityId: string, answers?: Array<{ questionId: string; answer: string | string[] | number }>) => Promise<Application>
  withdrawApplication: (id: string) => Promise<void>
  deleteApplication: (id: string) => Promise<void>
  clearError: () => void
}

export const useStudentApplicationHandler = (): UseStudentApplicationHandlerReturn => {
  const [applications, setApplications] = useState<Application[]>([])
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getApplications = useCallback(
    async (page: number = 1, pageSize: number = 10, status?: string): Promise<ListApplicationsResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, limit: pageSize }
        if (status) params.status = status

        const response = await api.get<{ status: string; data: ListApplicationsResponse }>('/api/student/applications', {
          params
        })
        const items = response.data.data?.items || []
        setApplications(items)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to get applications'
        setError(errorMessage)
        setApplications([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getApplication = useCallback(async (id: string): Promise<Application> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Application }>(`/api/student/applications/${id}`)
      setApplication(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get application'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkApplicationExists = useCallback(async (opportunityId: string): Promise<boolean> => {
    setError(null)
    try {
      const response = await api.get<{ status: string; data: { hasApplied: boolean } }>(`/api/student/applications/check/${opportunityId}`)
      return response.data.data.hasApplied
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to check application'
      setError(errorMessage)
      return false
    }
  }, [])

  const createApplication = useCallback(async (opportunityId: string, answers?: Array<{ questionId: string; answer: string | string[] | number }>): Promise<Application> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: Application }>('/api/student/applications', {
        opportunityId,
        answers: answers || []
      })
      setApplications(prev => [response.data.data, ...prev])
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create application'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const withdrawApplication = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.put(`/api/student/applications/${id}/withdraw`)
      setApplications(prev => prev.filter(app => app.id !== id))
      if (application?.id === id) {
        setApplication(null)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to withdraw application'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [application])

  const deleteApplication = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/api/student/applications/${id}`)
      setApplications(prev => prev.filter(app => app.id !== id))
      if (application?.id === id) {
        setApplication(null)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete application'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [application])

  return {
    applications,
    application,
    loading,
    error,
    getApplications,
    getApplication,
    checkApplicationExists,
    createApplication,
    withdrawApplication,
    deleteApplication,
    clearError
  }
}

