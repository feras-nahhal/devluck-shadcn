"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


export interface Program {
  id: string
  name: string
  description?: string
  companyId?: string
  createdAt: string
  updatedAt: string
}

interface ProgramData {
  name: string
  description?: string
}
 
interface UseProgramHandlerReturn {
  programs: Program[]
  program: Program | null
  loading: boolean
  error: string | null
  getPrograms: () => Promise<Program[]>
  createProgram: (data: ProgramData) => Promise<Program>
  updateProgram: (id: string, data: Partial<ProgramData>) => Promise<Program>
  deleteProgram: (id: string) => Promise<void>
  bulkUpdatePrograms: (programNames: string[]) => Promise<Program[]>
  clearError: () => void
}

export const useProgramHandler = (): UseProgramHandlerReturn => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getPrograms = useCallback(async (): Promise<Program[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Program[] }>('/company/programs')
      setPrograms(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get programs'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProgram = useCallback(async (data: ProgramData): Promise<Program> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: Program }>('/company/programs', data)
      setPrograms(prev => [response.data.data, ...prev])
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create program'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProgram = useCallback(async (id: string, data: Partial<ProgramData>): Promise<Program> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put<{ status: string; data: Program }>(`/company/programs/${id}`, data)
      setPrograms(prev => prev.map(p => p.id === id ? response.data.data : p))
      if (program?.id === id) {
        setProgram(response.data.data)
      }
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update program'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [program])

  const deleteProgram = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/company/programs/${id}`)
      setPrograms(prev => prev.filter(p => p.id !== id))
      if (program?.id === id) {
        setProgram(null)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete program'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [program])

  const bulkUpdatePrograms = useCallback(async (programNames: string[]): Promise<Program[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put<{ status: string; data: Program[] }>('/company/programs', {
        programs: programNames
      })
      setPrograms(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update programs'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    programs,
    program,
    loading,
    error,
    getPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    bulkUpdatePrograms,
    clearError
  }
}

