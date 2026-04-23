"use client"

import { api } from '@/lib/api'
import { useCallback, useState } from 'react'


interface CompanyProgram {
    id: string
    name: string
    description?: string | null
}

export interface CompanyProfile {
    id: string
    name: string
    industry?: string | null
    website?: string | null
    corporate?: string | null
    description?: string | null
    logoUrl?: string | null
    logo?: string | null
    status?: string | null
    progress?: number | null
    size?: string | null
    foundedYear?: number | null
    location?: string | null
    email?: string
    createdAt?: string
    addresses?: Array<{
        id: string
        name: string
        tag: string
        address: string
        phoneNumber: string
        createdAt: string
    }>
    programs?: CompanyProgram[]
}

interface Employee {
    id: string
    contractTitle: string
    contractNumber: string
    status: string
    student: {
        id: string
        name: string
        email: string
        image?: string
        profileComplete: number
        status: string
        availability?: string
    } | null
}

interface UseCompanyProfileHandlerReturn {
    profile: CompanyProfile | null
    profileLoading: boolean
    profileError: string | null
    getProfile: () => Promise<CompanyProfile>
    updateProfile: (data: Partial<CompanyProfile>) => Promise<CompanyProfile>

    uploadLogoLoading: boolean
    uploadLogoError: string | null
    uploadLogo: (file: File) => Promise<{ logoUrl: string; progress?: number }>

    employees: Employee[]
    employeesLoading: boolean
    employeesError: string | null
    getEmployees: () => Promise<Employee[]>

    clearError: () => void
}

export const useCompanyProfileHandler = (): UseCompanyProfileHandlerReturn => {
    const [profile, setProfile] = useState<CompanyProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)

    const [uploadLogoLoading, setUploadLogoLoading] = useState(false)
    const [uploadLogoError, setUploadLogoError] = useState<string | null>(null)

    const [employees, setEmployees] = useState<Employee[]>([])
    const [employeesLoading, setEmployeesLoading] = useState(false)
    const [employeesError, setEmployeesError] = useState<string | null>(null)

    const clearError = useCallback(() => {
        setProfileError(null)
        setUploadLogoError(null)
        setEmployeesError(null)
    }, [])

    const getProfile = useCallback(async (): Promise<CompanyProfile> => {
        setProfileLoading(true)
        setProfileError(null)
        try {
            const response = await api.get<{ status: string; data: CompanyProfile }>('/company/profile')
            console.log('company profile', response.data.data)
            setProfile(response.data.data)
            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to get profile'
            setProfileError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setProfileLoading(false)
        }
    }, [])

    const updateProfile = useCallback(
        async (data: Partial<CompanyProfile>): Promise<CompanyProfile> => {
            setProfileLoading(true)
            setProfileError(null)
            try {
                const response = await api.put<{ status: string; data: CompanyProfile }>('/company/profile', data)
                setProfile(response.data.data)
                return response.data.data
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile'
                setProfileError(errorMessage)
                throw new Error(errorMessage)
            } finally {
                setProfileLoading(false)
            }
        },
        []
    )

    const uploadLogo = useCallback(async (file: File): Promise<{ logoUrl: string; progress?: number }> => {
        setUploadLogoLoading(true)
        setUploadLogoError(null)
        try {
            const form = new FormData()
            form.append('image', file)
            const response = await api.post<{ status: string; data: { logoUrl: string; progress?: number } }>(
                '/company/profile/logo',
                form,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            )

            setProfile((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    logoUrl: response.data.data.logoUrl,
                    logo: response.data.data.logoUrl,
                    progress: response.data.data.progress ?? prev.progress
                }
            })

            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to upload logo'
            setUploadLogoError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setUploadLogoLoading(false)
        }
    }, [])

    const getEmployees = useCallback(async (): Promise<Employee[]> => {
        setEmployeesLoading(true)
        setEmployeesError(null)
        try {
            const response = await api.get<{ status: string; data: Employee[] }>('/company/employees')
            console.log('company employees', response.data.data)
            setEmployees(response.data.data)
            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to get employees'
            setEmployeesError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setEmployeesLoading(false)
        }
    }, [])

    return {
        profile,
        profileLoading,
        profileError,
        getProfile,
        updateProfile,
        uploadLogoLoading,
        uploadLogoError,
        uploadLogo,
        employees,
        employeesLoading,
        employeesError,
        getEmployees,
        clearError
    }
}


