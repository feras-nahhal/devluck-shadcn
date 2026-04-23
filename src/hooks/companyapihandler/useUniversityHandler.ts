import { useState, useCallback } from 'react'
import { api } from '../../lib/api'

export interface University {
  id: string
  name: string
  address?: string | null
  email?: string | null
  phoneNumber?: string | null
  description?: string | null
  corporate?: string | null
  website?: string | null
  image?: string | null
  programs: string[]
  totalStudents: number
  ugStudents: number
  pgStudents: number
  staff: number
  totalDoctors: number
  qsWorldRanking?: number | null
  qsRankingBySubject?: number | null
  qsSustainabilityRanking?: number | null
  companyId?: string | null
  company?: {
    id: string
    name: string
    logo?: string | null
  } | null
  createdAt?: string
  updatedAt?: string
}

export interface UniversityInput {
  name: string
  address?: string
  email?: string
  phoneNumber?: string
  description?: string
  corporate?: string
  website?: string
  image?: string
  programs?: string[]
  totalStudents?: number
  ugStudents?: number
  pgStudents?: number
  staff?: number
  totalDoctors?: number
  qsWorldRanking?: number
  qsRankingBySubject?: number
  qsSustainabilityRanking?: number
}

interface ListUniversitiesResponse {
  items: University[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface UniversityStats {
  totalUniversities: number
}

interface UseUniversityHandlerReturn {
  universities: University[]
  university: University | null
  stats: UniversityStats | null
  loading: boolean
  error: string | null
  getUniversities: (page?: number, limit?: number, search?: string, sort?: string) => Promise<ListUniversitiesResponse>
  getUniversityById: (id: string) => Promise<University>
  createUniversity: (data: UniversityInput) => Promise<University>
  updateUniversity: (id: string, data: Partial<UniversityInput>) => Promise<University>
  deleteUniversity: (id: string) => Promise<void>
  getUniversityStats: () => Promise<UniversityStats>
  clearError: () => void
}

export const useUniversityHandler = (): UseUniversityHandlerReturn => {
  const [universities, setUniversities] = useState<University[]>([])
  const [university, setUniversity] = useState<University | null>(null)
  const [stats, setStats] = useState<UniversityStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getUniversities = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      search: string = '',
      sort: string = 'name'
    ): Promise<ListUniversitiesResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, limit }
        if (search) {
          params.search = search
        }
        if (sort) {
          params.sort = sort
        }

        const response = await api.get<{ status: string; data: ListUniversitiesResponse }>(
          '/api/company/universities',
          { params }
        )

        setUniversities(response.data.data.items)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to get universities'
        setError(errorMessage)
        setUniversities([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getUniversityById = useCallback(async (id: string): Promise<University> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: University }>(
        `/api/company/universities/${id}`
      )
      setUniversity(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get university'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createUniversity = useCallback(async (data: UniversityInput): Promise<University> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: University }>(
        '/api/company/universities',
        data
      )
      const newUniversity = response.data.data
      setUniversities((prev) => [newUniversity, ...prev])
      return newUniversity
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create university'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUniversity = useCallback(
    async (id: string, data: Partial<UniversityInput>): Promise<University> => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.put<{ status: string; data: University }>(
          `/api/company/universities/${id}`,
          data
        )
        const updatedUniversity = response.data.data
        setUniversities((prev) =>
          prev.map((uni) => (uni.id === id ? updatedUniversity : uni))
        )
        if (university?.id === id) {
          setUniversity(updatedUniversity)
        }
        return updatedUniversity
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update university'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [university]
  )

  const deleteUniversity = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/api/company/universities/${id}`)
      setUniversities((prev) => prev.filter((uni) => uni.id !== id))
      if (university?.id === id) {
        setUniversity(null)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete university'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [university])

  const getUniversityStats = useCallback(async (): Promise<UniversityStats> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: UniversityStats }>(
        '/api/company/universities/stats'
      )
      setStats(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get university stats'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    universities,
    university,
    stats,
    loading,
    error,
    getUniversities,
    getUniversityById,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    getUniversityStats,
    clearError
  }
}

