import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface Dispute {
  id: string
  contractId: string
  studentId: string
  companyId: string
  reason: string
  note?: string
  status: 'Open' | 'UnderReview' | 'Resolved' | 'Rejected'
  resolution?: string
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  contract?: {
    id: string
    contractTitle: string
    inContractNumber: string
    status: string
    duration?: string
    monthlyAllowance?: number
    currency?: string
  }
  student?: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface ListDisputesResponse {
  items: Dispute[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface DisputeStats {
  total: number
  open: number
  underReview: number
  resolved: number
  rejected: number
  pending: number
}

interface UseCompanyDisputeHandlerReturn {
  disputes: Dispute[]
  dispute: Dispute | null
  stats: DisputeStats | null
  loading: boolean
  error: string | null
  listDisputes: (page?: number, pageSize?: number, status?: string) => Promise<ListDisputesResponse>
  getDisputeById: (id: string) => Promise<Dispute>
  updateDisputeStatus: (id: string, status: 'Open' | 'UnderReview') => Promise<Dispute>
  resolveDispute: (id: string, resolution: string, newContractStatus: string) => Promise<Dispute>
  rejectDispute: (id: string, resolution: string) => Promise<Dispute>
  getDisputeStats: () => Promise<DisputeStats>
  clearError: () => void
}

export const useCompanyDisputeHandler = (): UseCompanyDisputeHandlerReturn => {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [stats, setStats] = useState<DisputeStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const listDisputes = useCallback(
    async (page: number = 1, pageSize: number = 10, status?: string): Promise<ListDisputesResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, pageSize }
        if (status) params.status = status

        const response = await api.get<{ status: string; data: ListDisputesResponse }>('/company/disputes', {
          params
        })
        console.log('list company disputes response:', response.data)
        setDisputes(response.data.data.items)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to list disputes'
        setError(errorMessage)
        setDisputes([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getDisputeById = useCallback(async (id: string): Promise<Dispute> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Dispute }>(`/company/disputes/${id}`)
      console.log('get company dispute response:', response.data)
      setDispute(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get dispute'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateDisputeStatus = useCallback(
    async (id: string, status: 'Open' | 'UnderReview'): Promise<Dispute> => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.put<{ status: string; data: Dispute; message?: string }>(
          `/company/disputes/${id}/status`,
          { status }
        )
        console.log('update dispute status response:', response.data)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update dispute status'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const resolveDispute = useCallback(
    async (id: string, resolution: string, newContractStatus: string): Promise<Dispute> => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.put<{ status: string; data: Dispute; message?: string }>(
          `/company/disputes/${id}/resolve`,
          { resolution, newContractStatus }
        )
        console.log('resolve dispute response:', response.data)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to resolve dispute'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const rejectDispute = useCallback(
    async (id: string, resolution: string): Promise<Dispute> => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.put<{ status: string; data: Dispute; message?: string }>(
          `/company/disputes/${id}/reject`,
          { resolution }
        )
        console.log('reject dispute response:', response.data)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to reject dispute'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getDisputeStats = useCallback(async (): Promise<DisputeStats> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: DisputeStats }>('/company/disputes/stats')
      console.log('get dispute stats response:', response.data)
      setStats(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get dispute statistics'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    disputes,
    dispute,
    stats,
    loading,
    error,
    listDisputes,
    getDisputeById,
    updateDisputeStatus,
    resolveDispute,
    rejectDispute,
    getDisputeStats,
    clearError
  }
}

