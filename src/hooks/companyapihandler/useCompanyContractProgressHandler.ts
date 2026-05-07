"use client"

import { useCallback, useState } from "react"
import { api } from "@/lib/api"

export interface CompanyContractProgressReport {
  id: string
  report: string
  links?: { title: string; url: string }[] | null
  files?: { fileName: string; fileUrl: string }[] | null
  createdAt: string
  updatedAt: string
}

interface ContractProgressPayload {
  contract: {
    id: string
    workProgress: number
    status: string
    contractTitle: string
  }
  reports: CompanyContractProgressReport[]
}

export const useCompanyContractProgressHandler = () => {
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const getContractProgressReports = useCallback(async (contractId: string): Promise<ContractProgressPayload> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: ContractProgressPayload }>(
        `/company/contracts/${contractId}/progress-reports`
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to load contract reports"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateContractProgress = useCallback(async (contractId: string, workProgress: number) => {
    setUpdating(true)
    setError(null)
    try {
      const response = await api.patch(`/company/contracts/${contractId}/progress`, { workProgress })
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to update contract progress"
      setError(message)
      throw new Error(message)
    } finally {
      setUpdating(false)
    }
  }, [])

  return {
    loading,
    updating,
    error,
    clearError,
    getContractProgressReports,
    updateContractProgress
  }
}

