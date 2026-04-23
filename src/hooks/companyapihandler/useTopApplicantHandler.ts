import { useState, useCallback } from 'react'
import { api } from '../../lib/api'

export interface TopApplicant {
  id: string
  name: string
  image?: string | null
  description?: string | null
  profileRanking?: number | null
  profileComplete?: number | null
  email?: string | null
  availability?: string | null
  status?: string | null
  salaryExpectation?: number | null
  applicationCount: number
}

interface ListTopApplicantsResponse {
  items: TopApplicant[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
 
interface TopApplicantDetail extends TopApplicant {
  skills?: Array<{
    skill: {
      id: string
      name: string
    }
  }>
  experiences?: Array<{
    id: string
    role: string
    companyName: string
    date: string
    description: string
  }>
  educations?: Array<{
    id: string
    name: string
    major: string
    date: string
    description: string
  }>
  languages?: Array<{
    id: string
    name: string
    level: string
  }>
  portfolios?: Array<{
    id: string
    name: string
    link: string
  }>
  addresses?: Array<{
    id: string
    city?: string
  }>
}

interface UseTopApplicantHandlerReturn {
  topApplicants: TopApplicant[]
  topApplicant: TopApplicantDetail | null
  loading: boolean
  error: string | null
  getTopApplicants: (page?: number, limit?: number, search?: string) => Promise<ListTopApplicantsResponse>
  getTopApplicantById: (studentId: string) => Promise<TopApplicantDetail>
  clearError: () => void
}

export const useTopApplicantHandler = (): UseTopApplicantHandlerReturn => {
  const [topApplicants, setTopApplicants] = useState<TopApplicant[]>([])
  const [topApplicant, setTopApplicant] = useState<TopApplicantDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getTopApplicants = useCallback(
    async (page: number = 1, limit: number = 10, search: string = ''): Promise<ListTopApplicantsResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, limit }
        if (search) {
          params.search = search
        }

        const response = await api.get<{ status: string; data: ListTopApplicantsResponse }>(
          '/api/company/top-applicants',
          { params }
        )

        setTopApplicants(response.data.data.items)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to get top applicants'
        setError(errorMessage)
        setTopApplicants([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getTopApplicantById = useCallback(async (studentId: string): Promise<TopApplicantDetail> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: TopApplicantDetail }>(
        `/api/company/top-applicants/${studentId}`
      )
      setTopApplicant(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get applicant details'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    topApplicants,
    topApplicant,
    loading,
    error,
    getTopApplicants,
    getTopApplicantById,
    clearError
  }
}

