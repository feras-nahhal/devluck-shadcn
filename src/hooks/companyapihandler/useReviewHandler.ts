"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


export interface Review {
  id: string
  studentId: string
  name: string
  review: string
  rating: number
  contractId: string
  contractTitle?: string
  studentImage?: string
  createdAt: string
  updatedAt: string
}

interface UseReviewHandlerReturn {
  reviews: Review[]
  review: Review | null
  loading: boolean
  error: string | null
  getReviews: (companyId?: string) => Promise<Review[]>
  clearError: () => void
}

export const useReviewHandler = (): UseReviewHandlerReturn => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getReviews = useCallback(async (companyId?: string): Promise<Review[]> => {
    setLoading(true)
    setError(null)
    try {
      const url = companyId 
        ? `/company/reviews?companyId=${companyId}`
        : '/company/reviews'
      const response = await api.get<{ status: string; data: Review[] }>(url)
      setReviews(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get reviews'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    reviews,
    review,
    loading,
    error,
    getReviews,
    clearError
  }
}

