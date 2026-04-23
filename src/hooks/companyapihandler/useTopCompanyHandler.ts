import { useState, useCallback } from 'react'
import { api } from '../../lib/api'
import { TopCompany } from '@/types/company'




interface ListTopCompaniesResponse {
  items: TopCompany[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface TopCompanyDetail extends TopCompany {
  image?: string | null
  profileRanking?: number | null
  progress?: number | null
  corporate?: string | null
  employees?: Array<{
    id: string
    contractTitle: string
    status: string
    contractNumber: string
    progress?: number | null
    student: {
      id: string
      name: string
      email: string
      image?: string | null
      profileComplete?: number
      status?: string
      availability?: string
    }
  }>
  programs?: Array<{
    id: string
    name: string
  }>
  addresses?: Array<{
    id: string
    name?: string
    tag?: string
    address?: string
    phoneNumber?: string
  }>
  _count?: {
    contracts: number
  }
  contractsCount?: number
}

interface UseTopCompanyHandlerReturn {
  topCompanies: TopCompany[]
  topCompany: TopCompanyDetail | null
  loading: boolean
  error: string | null
  getTopCompanies: (page?: number, limit?: number, search?: string) => Promise<ListTopCompaniesResponse>
  getTopCompanyById: (companyId: string) => Promise<TopCompanyDetail>
  clearError: () => void
}

export const useTopCompanyHandler = (): UseTopCompanyHandlerReturn => {
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([])
  const [topCompany, setTopCompany] = useState<TopCompanyDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getTopCompanies = useCallback(
    async (page: number = 1, limit: number = 10, search: string = ''): Promise<ListTopCompaniesResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, limit }
        if (search) {
          params.search = search
        }

        const response = await api.get<{ status: string; data: ListTopCompaniesResponse }>(
          '/api/company/top-companies',
          { params }
        )

        setTopCompanies(response.data.data.items)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to get top companies'
        setError(errorMessage)
        setTopCompanies([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getTopCompanyById = useCallback(async (companyId: string): Promise<TopCompanyDetail> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: TopCompanyDetail }>(
        `/api/company/top-companies/${companyId}`
      )
      const companyData = {
        ...response.data.data,
        image: response.data.data.logo || response.data.data.image,
        contractsCount: response.data.data._count?.contracts || 0
      }
      setTopCompany(companyData)
      return companyData
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get company details'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    topCompanies,
    topCompany,
    loading,
    error,
    getTopCompanies,
    getTopCompanyById,
    clearError
  }
}

