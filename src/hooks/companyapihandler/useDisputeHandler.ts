"use client"

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
  previousContractStatus?: string
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
  }
  student?: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface UseDisputeHandlerReturn {
  dispute: Dispute | null
  loading: boolean
  error: string | null
  getDisputeByContractId: (contractId: string) => Promise<Dispute | null>
  resolveDispute: (disputeId: string, resolution: string, newContractStatus: string) => Promise<void>
  rejectDispute: (disputeId: string, resolution: string) => Promise<void>
  clearError: () => void
}

export const useDisputeHandler = (): UseDisputeHandlerReturn => {
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getDisputeByContractId = useCallback(async (contractId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Dispute }>(
        `/company/disputes/contract/${contractId}`
      )
      
      const dispute = response.data.data
      setDispute(dispute)
      setLoading(false)
      return dispute
    } catch (err: any) {
      if (err.response?.status === 404) {
        setDispute(null)
        setError(null)
        setLoading(false)
        return null
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dispute'
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }, [])

  const resolveDispute = useCallback(async (disputeId: string, resolution: string, newContractStatus: string) => {
    setLoading(true)
    setError(null)
    try {
      await api.post(`/company/disputes/${disputeId}/resolve`, {
        resolution,
        newContractStatus
      })
      setLoading(false)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resolve dispute'
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }, [])

  const rejectDispute = useCallback(async (disputeId: string, resolution: string) => {
    setLoading(true)
    setError(null)
    try {
      await api.post(`/company/disputes/${disputeId}/reject`, {
        resolution
      })
      setLoading(false)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reject dispute'
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    dispute,
    loading,
    error,
    getDisputeByContractId,
    resolveDispute,
    rejectDispute,
    clearError
  }
}
