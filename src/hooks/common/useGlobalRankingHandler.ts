import { useCallback, useState } from "react"
import { api } from "@/lib/api"

export interface RankingStudentSummary {
  id: string
  name: string
  email: string
  image: string | null
  availability: string | null
  profileComplete: number
  profileRanking: number | null
  salaryExpectation: number | null
}

export interface StudentGlobalRanking {
  studentId: string
  finalScore: number
  globalRank: number
  classification: string
  assessmentQualityScore: number
  completionReliabilityScore: number
  profileCompletionScore: number
  skillsExperienceScore: number
  activityScore: number
  penaltyScore: number
  computedAt: string
  createdAt: string
  updatedAt: string
  student: RankingStudentSummary
}

export interface ListStudentGlobalRankingsData {
  items: StudentGlobalRanking[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ApiEnvelope<T> {
  status: string
  data: T
}

interface ListStudentGlobalRankingsParams {
  page?: number
  limit?: number
  classification?: string
  search?: string
}

interface UseGlobalRankingHandlerReturn {
  rankings: StudentGlobalRanking[]
  ranking: StudentGlobalRanking | null
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  totalPages: number
  listStudentGlobalRankings: (params?: ListStudentGlobalRankingsParams) => Promise<ListStudentGlobalRankingsData>
  getStudentGlobalRankingByStudentId: (studentId: string) => Promise<StudentGlobalRanking>
  clearError: () => void
}

export const useGlobalRankingHandler = (): UseGlobalRankingHandlerReturn => {
  const [rankings, setRankings] = useState<StudentGlobalRanking[]>([])
  const [ranking, setRanking] = useState<StudentGlobalRanking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const listStudentGlobalRankings = useCallback(
    async (params: ListStudentGlobalRankingsParams = {}): Promise<ListStudentGlobalRankingsData> => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get<ApiEnvelope<ListStudentGlobalRankingsData>>("/api/rankings/students", {
          params
        })

        const data = response.data.data
        setRankings(data.items)
        setTotal(data.total)
        setPage(data.page)
        setPageSize(data.pageSize)
        setTotalPages(data.totalPages)

        return data
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || "Failed to fetch rankings"
        setError(message)
        setRankings([])
        throw new Error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getStudentGlobalRankingByStudentId = useCallback(async (studentId: string): Promise<StudentGlobalRanking> => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get<ApiEnvelope<StudentGlobalRanking>>(`/api/rankings/students/${studentId}`)
      const data = response.data.data
      setRanking(data)
      return data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch student ranking"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    rankings,
    ranking,
    loading,
    error,
    total,
    page,
    pageSize,
    totalPages,
    listStudentGlobalRankings,
    getStudentGlobalRankingByStudentId,
    clearError
  }
}
