"use client"

import { api } from "@/lib/api";
import { useCallback, useState } from "react"


type InvitePayload = { name?: string; email?: string }

export const useCompanyAssessmentHandler = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const getCandidates = useCallback(async (opportunityId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: { candidates: any[] } }>(
        `/api/company/opportunities/${opportunityId}/assessment/candidates`
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch candidates"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getReport = useCallback(async (sessionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: any }>(
        `/api/company/assessment/sessions/${sessionId}/report`
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch report"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getSession = useCallback(async (sessionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: any }>(
        `/api/company/assessment/sessions/${sessionId}`
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch session"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const retryEvaluation = useCallback(async (sessionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: any }>(
        `/api/company/assessment/sessions/${sessionId}/retry-evaluation`
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to retry evaluation"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const sendAssessmentInvite = useCallback(async (opportunityId: string, data: InvitePayload) => {
    setLoading(true)
    setError(null)
    try {
      const base = (process.env.NEXT_PUBLIC_BACKENDAI_URL || "http://localhost:8001").replace(/\/$/, "")
      const token = typeof window !== "undefined" ? localStorage.getItem("devluck_token") : null
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      }
      if (token) headers.Authorization = `Bearer ${token}`

      const url = `${base}/api/invites`
      const payload = {
        opportunity_id: opportunityId,
        candidate_name: data.name || undefined,
        candidate_email: data.email || undefined
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      })
      const raw = await response.text()
      const parsed = raw ? JSON.parse(raw) : null

      if (!response.ok) {
        throw new Error(parsed?.detail || parsed?.message || "Failed to send invite")
      }

      return parsed
    } catch (err: any) {
      const message = err.message || "Failed to send invite"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    clearError,
    getCandidates,
    getSession,
    getReport,
    retryEvaluation,
    sendAssessmentInvite
  }
}
