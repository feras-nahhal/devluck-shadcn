"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface Review {
  id: string
  studentId: string
  name: string
  review: string
  rating: number
  contractId: string
  companyId: string
  createdAt: string
  updatedAt: string
}

interface CompanyReview {
  id: string
  reviewerName: string
  reviewerImage: string
  dateReviewed: string
  rating: number
  reviewText: string
  createdAt: string
}

interface CreateReviewData {
  review: string
  rating: number
  contractId: string
}

interface UseStudentReviewHandlerReturn {
  reviews: Review[]
  loading: boolean
  error: string | null
  createReview: (data: CreateReviewData) => Promise<Review>
  getReviewsByContract: (contractId: string) => Promise<Review[]>
  getReviewsByCompanyId: (companyId: string) => Promise<CompanyReview[]>
  clearError: () => void
}

export const useStudentReviewHandler = (): UseStudentReviewHandlerReturn => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const createReview = useCallback(async (data: CreateReviewData): Promise<Review> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; message: string; data: Review }>('/api/student/reviews', data)
      const newReview = response.data.data
      setReviews(prev => [newReview, ...prev])
      return newReview
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to create review'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getReviewsByContract = useCallback(async (contractId: string): Promise<Review[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Review[] }>(`/api/student/contracts/${contractId}/reviews`)
      const reviewsData = response.data.data || []
      setReviews(reviewsData)
      return reviewsData
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to get reviews'
      setError(errorMessage)
      setReviews([])
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getReviewsByCompanyId = useCallback(async (companyId: string): Promise<CompanyReview[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: CompanyReview[] }>(`/api/student/companies/${companyId}/reviews`)
      const reviewsData = response.data.data || []
      return reviewsData
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to get reviews'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    reviews,
    loading,
    error,
    createReview,
    getReviewsByContract,
    getReviewsByCompanyId,
    clearError
  }
}

