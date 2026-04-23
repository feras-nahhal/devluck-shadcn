"use client"

import { api } from "@/lib/api"
import { useState, useCallback } from "react"


/* ──────────────────────────────────────────────
   Types (cleaned, no any where possible)
────────────────────────────────────────────── */

interface Skill {
  skill: {
    id: string
    name: string
  }
}

interface Student {
  id: string
  name: string
  description?: string
  status: string
  availability?: string
  profileRanking?: number
  profileComplete?: number
  skills?: Skill[]
  experiences?: unknown[]
  educations?: unknown[]
  languages?: unknown[]
  portfolios?: unknown[]
}

interface Opportunity {
  id: string
  title: string
  type: string
  companyId?: string
  company?: {
    id: string
    name: string
    logo?: string
  }
}

type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn"
type AssessmentStatus = "not_started" | "generating" | "in_progress" | "submitted" | "evaluating" | "completed" | "failed"

interface Application {
  id: string
  studentId: string
  opportunityId: string
  status: ApplicationStatus
  assessmentStatus?: AssessmentStatus
  appliedAt: string
  withdrawnAt?: string
  student?: Student
  opportunity?: Opportunity
  createdAt?: string
  updatedAt?: string
}

interface ListApplicationsResponse {
  items: Application[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface RecentApplicationsResponse {
  items: Application[]
  limit: number
}

interface EmailSuggestion {
  email: string
  id: string
  name: string
}

/* ──────────────────────────────────────────────
   Hook
────────────────────────────────────────────── */

export const useCompanyApplicationHandler = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [application, setApplication] = useState<Application | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /* ─────────────── safe error extractor ─────────────── */
  const getErrorMessage = (err: unknown): string => {
    if (typeof err === "object" && err !== null) {
      const e = err as {
        response?: { data?: { message?: string } }
        message?: string
      }

      return (
        e.response?.data?.message ||
        e.message ||
        "Something went wrong"
      )
    }

    return "Something went wrong"
  }

  /* ──────────────────────────────────────────────
     API METHODS
  ─────────────────────────────────────────────── */

  const getAllApplications = useCallback(
    async (
      page = 1,
      pageSize = 10,
      status?: string,
      opportunityId?: string
    ): Promise<ListApplicationsResponse> => {
      setLoading(true)
      setError(null)

      try {
        const params: Record<string, unknown> = {
          page,
          limit: pageSize,
        }

        if (status) params.status = status
        if (opportunityId) params.opportunityId = opportunityId

        const response = await api.get<{
          status: string
          data: ListApplicationsResponse
        }>("/api/company/applications", { params })

        const data = response.data.data

        setApplications(data?.items ?? [])

        return data
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        setApplications([])
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getApplicationsForOpportunity = useCallback(
    async (
      opportunityId: string,
      page = 1,
      pageSize = 10,
      status?: string
    ): Promise<ListApplicationsResponse> => {
      setLoading(true)
      setError(null)

      try {
        const params: Record<string, unknown> = {
          page,
          limit: pageSize,
        }

        if (status) params.status = status

        const response = await api.get<{
          status: string
          data: ListApplicationsResponse
        }>(
          `/api/company/opportunities/${opportunityId}/applications`,
          { params }
        )

        const data = response.data.data
        setApplications(data?.items ?? [])

        return data
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        setApplications([])
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getApplicationById = useCallback(
    async (id: string): Promise<Application> => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get<{
          status: string
          data: Application
        }>(`/api/company/applications/${id}`)

        const data = response.data.data
        setApplication(data)

        return data
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getStudentProfileById = useCallback(
    async (studentId: string): Promise<Student> => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get<{
          status: string
          data: Student
        }>(`/api/company/students/${studentId}`, {
          params: { fullProfile: true },
        })

        const data = response.data.data
        setStudent(data)

        return data
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const searchStudentByName = useCallback(
    async (name: string): Promise<Student> => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get<{
          status: string
          data: Student
        }>("/api/company/students/search/by-name", {
          params: { name },
        })

        const data = response.data.data
        setStudent(data)

        return data
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const searchUserByEmail = useCallback(
    async (email: string): Promise<EmailSuggestion[]> => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get<{
          status: string
          data: EmailSuggestion[]
        }>("/api/company/students/search/by-email", {
          params: { email },
        })

        return response.data.data ?? []
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        return []
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getRecentApplicants = useCallback(
    async (limit = 5): Promise<RecentApplicationsResponse> => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get<{
          status: string
          data: RecentApplicationsResponse
        }>("/company/dashboard/recent-applicants", {
          params: { limit },
        })

        const data = response.data.data
        setApplications(data?.items ?? [])

        return data
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        setApplications([])
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateApplicationStatus = useCallback(
    async (
      id: string,
      status: "pending" | "accepted" | "rejected"
    ): Promise<Application> => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.put<{
          data: Application
        }>(`/api/company/applications/${id}/status`, {
          status,
        })

        const updated = response.data.data

        setApplications((prev) =>
          prev.map((a) => (a.id === id ? updated : a))
        )

        if (application?.id === id) {
          setApplication(updated)
        }

        return updated
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    [application]
  )

  const checkApplicantExistsForOpportunity = useCallback(
    async (opportunityId: string, email: string): Promise<{ exists: boolean; applicationId: string | null; student: { id: string; email: string; name: string } | null }> => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<{
          status: string
          data: { exists: boolean; applicationId: string | null; student: { id: string; email: string; name: string } | null }
        }>(`/api/company/opportunities/${opportunityId}/applicants/check-email`, {
          params: { email },
        })
        return response.data.data
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteApplication = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        await api.delete(`/api/company/applications/${id}`)

        setApplications((prev) =>
          prev.filter((a) => a.id !== id)
        )

        if (application?.id === id) {
          setApplication(null)
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        setError(msg)
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    [application]
  )

  /* ──────────────────────────────────────────────
     RETURN (UNCHANGED AS YOU REQUESTED)
  ─────────────────────────────────────────────── */

  return {
    applications,
    application,
    student,
    loading,
    error,
    getAllApplications,
    getApplicationsForOpportunity,
    getApplicationById,
    getStudentProfileById,
    searchStudentByName,
    searchUserByEmail,
    getRecentApplicants,
    updateApplicationStatus,
    checkApplicantExistsForOpportunity,
    deleteApplication,
    clearError,
  }
}