"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface CompanySettingsData {
    theme?: string
    themeColor?: string
}

interface AddressData {
  name: string
  tag: string
  address: string
  phoneNumber: string
}

interface Address extends AddressData {
  id: string
  companyId?: string
  studentId?: string
  createdAt: string
  updatedAt: string
}

interface CompanyProfile {
    id: string
    name: string
    industry?: string
    website?: string
    description?: string
    logo?: string
    size?: string
    foundedYear?: number
    location?: string
    email: string
    createdAt: string
    programs?: Array<{
        id: string
        name: string
        description?: string
    }>
}

interface UseCompanySettingsHandlerReturn {
    // Settings
    settings: any
    loading: boolean
    error: string | null
    getSettings: () => Promise<any>
    updateSettings: (data: CompanySettingsData) => Promise<any>

    // Password
    changePasswordLoading: boolean
    changePasswordError: string | null
    changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>

    // Profile
    profile: CompanyProfile | null
    profileLoading: boolean
    profileError: string | null
    getProfile: () => Promise<CompanyProfile>
    updateProfile: (data: Partial<CompanyProfile>) => Promise<CompanyProfile>
    deleteProfile: () => Promise<void>

    // Addresses
    addresses: Address[]
    address: Address | null
    addressLoading: boolean
    addressError: string | null
    getAddresses: () => Promise<Address[]>
    createAddress: (data: AddressData) => Promise<Address>
    updateAddress: (id: string, data: Partial<AddressData>) => Promise<Address>
    deleteAddress: (id: string) => Promise<void>

    // Utilities
    clearError: () => void
}

export const useCompanySettingsHandler = (): UseCompanySettingsHandlerReturn => {
    // Settings states
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Password states
    const [changePasswordLoading, setChangePasswordLoading] = useState(false)
    const [changePasswordError, setChangePasswordError] = useState<string | null>(null)

    // Profile states
    const [profile, setProfile] = useState<CompanyProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)

    // Address states
    const [addresses, setAddresses] = useState<Address[]>([])
    const [address, setAddress] = useState<Address | null>(null)
    const [addressLoading, setAddressLoading] = useState(false)
    const [addressError, setAddressError] = useState<string | null>(null)

    const clearError = useCallback(() => {
        setError(null)
        setChangePasswordError(null)
        setProfileError(null)
        setAddressError(null)
    }, [])

    // Settings functions
    const getSettings = useCallback(async (): Promise<any> => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.get('/company/settings')
            setSettings(response.data.data)
            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to get settings'
            setError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    const updateSettings = useCallback(async (data: CompanySettingsData): Promise<any> => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.put('/company/settings', data)
            setSettings(response.data.data)
            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update settings'
            setError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    // Password function
    const changePassword = useCallback(async (
        currentPassword: string,
        newPassword: string,
        confirmPassword: string
    ): Promise<void> => {
        setChangePasswordLoading(true)
        setChangePasswordError(null)
        try {
            await api.put('/company/password', {
                currentPassword,
                newPassword,
                confirmPassword
            })
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to change password'
            setChangePasswordError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setChangePasswordLoading(false)
        }
    }, [])

    // Profile functions
    const getProfile = useCallback(async (): Promise<CompanyProfile> => {
        setProfileLoading(true)
        setProfileError(null)
        try {
            const response = await api.get('/company/profile')
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

    const updateProfile = useCallback(async (data: Partial<CompanyProfile>): Promise<CompanyProfile> => {
        setProfileLoading(true)
        setProfileError(null)
        try {
            const response = await api.put('/company/profile', data)
            setProfile(response.data.data)
            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile'
            setProfileError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setProfileLoading(false)
        }
    }, [])

    const deleteProfile = useCallback(async (): Promise<void> => {
        setProfileLoading(true)
        setProfileError(null)
        try {
            await api.delete('/company/profile')
            setProfile(null)
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete profile'
            setProfileError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setProfileLoading(false)
        }
    }, [])

    // Address functions
    const getAddresses = useCallback(async (): Promise<Address[]> => {
        setAddressLoading(true)
        setAddressError(null)
        try {
            const response = await api.get<{ status: string; data: Address[] }>('/api/company/addresses')
            setAddresses(response.data.data)
            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to get addresses'
            setAddressError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setAddressLoading(false)
        }
    }, [])

    const createAddress = useCallback(async (data: AddressData): Promise<Address> => {
        setAddressLoading(true)
        setAddressError(null)
        try {
            const response = await api.post<{ status: string; data: Address }>('/api/company/addresses', data)
            setAddresses(prev => [response.data.data, ...prev])
            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create address'
            setAddressError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setAddressLoading(false)
        }
    }, [])

    const updateAddress = useCallback(async (id: string, data: Partial<AddressData>): Promise<Address> => {
        setAddressLoading(true)
        setAddressError(null)
        try {
            const response = await api.put<{ status: string; data: Address }>(`/api/company/addresses/${id}`, data)
            setAddresses(prev => prev.map(addr => addr.id === id ? response.data.data : addr))
            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update address'
            setAddressError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setAddressLoading(false)
        }
    }, [])

    const deleteAddress = useCallback(async (id: string): Promise<void> => {
        setAddressLoading(true)
        setAddressError(null)
        try {
            await api.delete(`/api/company/addresses/${id}`)
            setAddresses(prev => prev.filter(addr => addr.id !== id))
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete address'
            setAddressError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setAddressLoading(false)
        }
    }, [])

    return {
        // Settings
        settings,
        loading,
        error,
        getSettings,
        updateSettings,

        // Password
        changePasswordLoading,
        changePasswordError,
        changePassword,

        // Profile
        profile,
        profileLoading,
        profileError,
        getProfile,
        updateProfile,
        deleteProfile,

        // Addresses
        addresses,
        address,
        addressLoading,
        addressError,
        getAddresses,
        createAddress,
        updateAddress,
        deleteAddress,

        // Utilities
        clearError
    }
}
