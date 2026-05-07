"use client"

import { useCallback, useState } from "react"
import { api } from "@/lib/api"

export interface ContractProgressLinkPayload {
  title: string
  url: string
}

export interface ContractProgressFilePayload {
  fileName: string
  fileUrl: string
  publicId?: string | null
  mimeType?: string | null
  size?: number | null
  resourceType?: string | null
  format?: string | null
}

export interface ContractProgressItem {
  id: string
  contractId: string
  studentId: string
  report: string
  links?: ContractProgressLinkPayload[] | null
  files?: ContractProgressFilePayload[] | null
  createdAt: string
  updatedAt: string
}

interface CreateContractProgressPayload {
  report: string
  links?: ContractProgressLinkPayload[]
  files?: File[]
}

export const useStudentContractProgressHandler = () => {
  const [progressItems, setProgressItems] = useState<ContractProgressItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const listProgress = useCallback(async (contractId: string): Promise<ContractProgressItem[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: ContractProgressItem[] }>(
        `/api/student/contracts/${contractId}/progress`
      )
      const items = response.data.data || []
      setProgressItems(items)
      return items
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch contract progress"
      setError(message)
      setProgressItems([])
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProgress = useCallback(
    async (contractId: string, payload: CreateContractProgressPayload): Promise<ContractProgressItem> => {
      setSubmitting(true)
      setError(null)
      try {
        const formData = new FormData()
        formData.append("report", payload.report)

        if (payload.links && payload.links.length > 0) {
          formData.append("links", JSON.stringify(payload.links))
        }

        if (payload.files && payload.files.length > 0) {
          payload.files.forEach((file) => {
            formData.append("files", file)
          })
        }

        const response = await api.post<{ status: string; data: ContractProgressItem }>(
          `/api/student/contracts/${contractId}/progress`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        )

        const created = response.data.data
        setProgressItems((prev) => [created, ...prev])
        return created
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || "Failed to submit contract progress"
        setError(message)
        throw new Error(message)
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  return {
    progressItems,
    loading,
    submitting,
    error,
    clearError,
    listProgress,
    createProgress
  }
}

