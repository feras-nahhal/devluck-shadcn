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
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  contract?: {
    id: string
    contractTitle: string
    inContractNumber: string
    status: string
  }
  company?: {
    id: string
    name: string
    logo?: string
  }
}

interface CreateDisputeData {
  reason: string
  note?: string
}

interface ListDisputesResponse {
  items: Dispute[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface UseStudentDisputeHandlerReturn {
  disputes: Dispute[]
  dispute: Dispute | null
  loading: boolean
  error: string | null
  createDispute: (contractId: string, data: CreateDisputeData) => Promise<Dispute>
  listDisputes: (page?: number, pageSize?: number, status?: string) => Promise<ListDisputesResponse>
  getDisputeById: (id: string) => Promise<Dispute>
  clearError: () => void
}

export const useStudentDisputeHandler = (): UseStudentDisputeHandlerReturn => {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const createDispute = useCallback(async (contractId: string, data: CreateDisputeData): Promise<Dispute> => {
    console.log('createDispute called with:', { contractId, data })
    setLoading(true)
    setError(null)
    try {
      const url = `/api/student/contracts/${contractId}/dispute`
      console.log('API URL:', url)
      console.log('Sending request...')
      
      const response = await api.post<{ status: string; data: Dispute; message?: string }>(
        url,
        data
      )
      console.log('create dispute response:', response.data)
      return response.data.data
    } catch (err: any) {
      console.error('createDispute error:', err)
      console.error('Error response:', err.response?.data)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create dispute'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
      console.log('createDispute finished, loading set to false')
    }
  }, [])

  const listDisputes = useCallback(
    async (page: number = 1, pageSize: number = 10, status?: string): Promise<ListDisputesResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, pageSize }
        if (status) params.status = status

        const response = await api.get<{ status: string; data: ListDisputesResponse }>('/api/student/disputes', {
          params
        })
        console.log('list disputes response:', response.data)
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
      const response = await api.get<{ status: string; data: Dispute }>(`/api/student/disputes/${id}`)
      console.log('get dispute response:', response.data)
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

  return {
    disputes,
    dispute,
    loading,
    error,
    createDispute,
    listDisputes,
    getDisputeById,
    clearError
  }
}

