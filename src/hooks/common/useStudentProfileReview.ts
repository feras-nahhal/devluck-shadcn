"use client"

import { api } from '@/lib/api'
import { useState, useCallback, useRef } from 'react'

interface StudentReview {
  id: string
  reviewerName: string
  reviewerImage: string | null
  reviewerRole: string
  dateReviewed: string
  rating: number
  reviewText: string
  createdAt: string
}

interface CreateStudentReviewData {
  rating: number
  comment: string
}

interface ToastState {
  message: string
  type: 'success' | 'error'
}

interface UseStudentProfileReviewReturn {
  reviews: StudentReview[]
  loading: boolean
  error: string | null
  toast: ToastState | null
  closeToast: () => void
  getStudentReviews: (studentId: string) => Promise<void>
  createStudentReview: (studentId: string, data: CreateStudentReviewData) => Promise<void>
  clearError: () => void
}

export const useStudentProfileReview = (): UseStudentProfileReviewReturn => {
  const [reviews, setReviews] = useState<StudentReview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const fetchedIdRef = useRef<string | null>(null)
  const isFetchingRef = useRef(false)

  const clearError = useCallback(() => setError(null), [])
  const closeToast = useCallback(() => setToast(null), [])

  const getStudentReviews = useCallback(async (studentId: string): Promise<void> => {
    if (!studentId) return
    if (isFetchingRef.current) return
    if (fetchedIdRef.current === studentId) return

    isFetchingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: StudentReview[] }>(
        `/api/students/${studentId}/reviews`
      )
      fetchedIdRef.current = studentId
      setReviews(response.data.data || [])
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to get reviews'
      setError(message)
      setReviews([])
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  const createStudentReview = useCallback(
    async (studentId: string, data: CreateStudentReviewData): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.post<{ status: string; message: string; data: StudentReview }>(
          `/api/students/${studentId}/reviews`,
          data
        )
        setReviews(prev => [response.data.data, ...prev])
        setToast({ message: 'Review submitted successfully!', type: 'success' })
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to submit review'
        setError(message)
        setToast({ message, type: 'error' })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    reviews,
    loading,
    error,
    toast,
    closeToast,
    getStudentReviews,
    createStudentReview,
    clearError
  }
}
