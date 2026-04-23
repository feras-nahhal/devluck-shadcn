"use client"

import { api } from "@/lib/api"
import { useCallback, useState } from "react"


interface StartAssessmentResponse {
  sessionId: string
  aiStatus: string
  questionsGenerated: number
  alreadyStarted: boolean
}

interface AssessmentStateResponse {
  hasSession: boolean
  sessionId: string | null
  sessionStatus: string | null
}

interface AssessmentListItem {
  source: "public" | "private"
  applicationId: string | null
  inviteToken: string | null
  opportunity: {
    id: string
    title: string
    visibility: string
    hasAssessment: boolean
    companyStyle?: string
    assessmentDeadlineHours?: number | null
  } | null
  appliedAt: string
  assessmentStatus: string
  sessionId: string | null
  sessionStatus: string | null
  hasReport: boolean
  canStart: boolean
}

interface SessionData {
  session_id: string
  status: string
  company_style: string
  created_at: string
  started_at?: string
  expires_at?: string
  current_question_index?: number
  progress: {
    total_questions: number
    answered: number
    evaluated: number
    remaining: number
  }
  questions: Array<{
    id: string
    question_text: string
    question_type: string
    time_limit_seconds: number
    choices?: string[]
  }>
  answers: Record<string, string>
  evaluations: Record<string, unknown>
}

interface SubmitAnswerResponse {
  saved: boolean
  question_id: string
  answered_count: number
}

interface SubmitAssessmentResponse {
  status: string
  report_generated: boolean
}

export const useStudentAssessmentHandler = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const startAssessment = useCallback(async (applicationId: string): Promise<StartAssessmentResponse> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: StartAssessmentResponse }>(
        "/api/student/assessment/start",
        { applicationId }
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to start assessment"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const listAssessments = useCallback(async (scope: "all" | "public" | "private" = "all"): Promise<AssessmentListItem[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: AssessmentListItem[] }>(`/api/student/assessment/list`, {
        params: { scope }
      })
      return response.data.data || []
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch assessments"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const startAssessmentFromInvite = useCallback(async (inviteToken: string): Promise<StartAssessmentResponse> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: StartAssessmentResponse }>(
        `/api/student/assessment/invites/${inviteToken}/start`
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to start invite assessment"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getSession = useCallback(async (sessionId: string): Promise<SessionData> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: SessionData }>(`/api/student/assessment/${sessionId}`)
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to get session"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getAssessmentState = useCallback(async (applicationId: string): Promise<AssessmentStateResponse> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: AssessmentStateResponse }>(
        `/api/student/assessment/state/${applicationId}`
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to get assessment state"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const beginAssessment = useCallback(async (sessionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: any }>(`/api/student/assessment/${sessionId}/start`)
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to begin assessment"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const submitAnswer = useCallback(async (sessionId: string, questionId: string, answer: string): Promise<SubmitAnswerResponse> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: SubmitAnswerResponse }>(
        `/api/student/assessment/${sessionId}/answer`,
        { questionId, answer }
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to submit answer"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const sendTelemetry = useCallback(async (sessionId: string, questionId: string, events: Array<{ event_type: string; event_data?: Record<string, unknown>; timestamp?: number }>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: any }>(
        `/api/student/assessment/${sessionId}/telemetry`,
        { questionId, events }
      )
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to send telemetry"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const submitAssessment = useCallback(async (sessionId: string): Promise<SubmitAssessmentResponse> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: SubmitAssessmentResponse }>(`/api/student/assessment/${sessionId}/submit`)
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to submit assessment"
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
    listAssessments,
    startAssessment,
    startAssessmentFromInvite,
    getAssessmentState,
    getSession,
    beginAssessment,
    submitAnswer,
    sendTelemetry,
    submitAssessment
  }
}
