"use client"

import { api } from "@/lib/api"
import { useCallback, useState } from "react"


type AssignInterviewPayload = {
  opportunityId: string
  studentId: string
  applicationId?: string
  interviewDate: string
  interviewTime: string
  timeZone?: string
  meetingLink: string
  notes?: string
}

export const useCompanyInterviewHandler = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assignInterview = useCallback(async (payload: AssignInterviewPayload) => {
    setLoading(true)
    setError(null)
    try {
      const browserTimeZone =
        typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"
      const response = await api.post<{ status: string; data: any }>(
        "/api/company/interviews",
        {
          ...payload,
          timeZone: payload.timeZone || browserTimeZone
        }
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to assign interview"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getStudentUpcomingInterviews = useCallback(async (studentId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: any[] }>(
        `/api/interviews/student/${studentId}`
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch interviews"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    assignInterview,
    getStudentUpcomingInterviews
  }
}
