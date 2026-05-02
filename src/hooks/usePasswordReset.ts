"use client"

import { useCallback, useState } from "react"
import { api } from "@/lib/api"

interface ApiResponse {
  status: string
  message: string
}

interface UsePasswordResetReturn {
  forgotPassword: (email: string) => Promise<string>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<string>
  loading: boolean
  error: string | null
  clearError: () => void
}

export const usePasswordReset = (): UsePasswordResetReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<ApiResponse>("/auth/forgot-password", { email })
      return response.data.message
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to request password reset"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<ApiResponse>("/auth/reset-password", {
        email,
        code,
        newPassword,
      })
      return response.data.message
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to reset password"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    forgotPassword,
    resetPassword,
    loading,
    error,
    clearError,
  }
}
