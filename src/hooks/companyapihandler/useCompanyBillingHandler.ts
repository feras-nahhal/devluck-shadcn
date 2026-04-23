"use client"

import { api } from "@/lib/api"
import { useCallback, useState } from "react"


type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete" | null

interface SubscriptionStatusData {
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  subscriptionStatus: SubscriptionStatus
  subscriptionCurrentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  questionCountOptions: number[]
  questionCountMax: number
  basicQuestionCountOptions: number[]
  proQuestionCountOptions: number[]
}

interface CheckoutSessionData {
  sessionId: string
  checkoutUrl: string
}

interface ApplicantQuotaData {
  usageId: string
  used: number
  limit: number
  remaining: number
  periodStart: string
  periodEnd: string
}

interface UseCompanyBillingHandlerReturn {
  loading: boolean
  error: string | null
  getSubscriptionStatus: () => Promise<SubscriptionStatusData>
  getApplicantQuotaStatus: () => Promise<ApplicantQuotaData>
  createCheckoutSession: () => Promise<CheckoutSessionData>
  cancelSubscription: (cancelNow?: boolean) => Promise<void>
  clearError: () => void
}

export const useCompanyBillingHandler = (): UseCompanyBillingHandlerReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getSubscriptionStatus = useCallback(async (): Promise<SubscriptionStatusData> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: SubscriptionStatusData }>(
        "/company/billing/subscription-status"
      )
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to load subscription status"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCheckoutSession = useCallback(async (): Promise<CheckoutSessionData> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: CheckoutSessionData }>(
        "/company/billing/checkout-session"
      )
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create checkout session"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getApplicantQuotaStatus = useCallback(async (): Promise<ApplicantQuotaData> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: ApplicantQuotaData }>(
        "/company/billing/applicant-quota"
      )
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to load applicant quota"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelSubscription = useCallback(async (cancelNow: boolean = false): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.post("/company/billing/cancel-subscription", { cancelNow })
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to cancel subscription"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getSubscriptionStatus,
    getApplicantQuotaStatus,
    createCheckoutSession,
    cancelSubscription,
    clearError
  }
}
