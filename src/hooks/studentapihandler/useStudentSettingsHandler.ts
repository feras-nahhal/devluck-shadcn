"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface SettingsData {
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
  studentId: string
  createdAt: string
  updatedAt: string
}

interface UseStudentSettingsHandlerReturn {
  // Settings
  settings: any
  settingsLoading: boolean
  settingsError: string | null
  getSettings: () => Promise<any>
  updateSettings: (data: SettingsData) => Promise<any>

  // Password
  changePasswordLoading: boolean
  changePasswordError: string | null
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>

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

export const useStudentSettingsHandler = (): UseStudentSettingsHandlerReturn => {
  // Settings states
  const [settings, setSettings] = useState<any>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  // Password states
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([])
  const [address, setAddress] = useState<Address | null>(null)
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setSettingsError(null)
    setChangePasswordError(null)
    setAddressError(null)
  }, [])

  // Settings functions
  const getSettings = useCallback(async (): Promise<any> => {
    setSettingsLoading(true)
    setSettingsError(null)
    try {
      const response = await api.get('/api/student/settings')
      setSettings(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get settings'
      setSettingsError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (data: SettingsData): Promise<any> => {
    setSettingsLoading(true)
    setSettingsError(null)
    try {
      const response = await api.put('/api/student/settings', data)
      setSettings(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update settings'
      setSettingsError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setSettingsLoading(false)
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
      await api.put('/api/student/password', {
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

  // Address functions
  const getAddresses = useCallback(async (): Promise<Address[]> => {
    setAddressLoading(true)
    setAddressError(null)
    try {
      const response = await api.get<{ status: string; data: Address[] }>('/api/student/addresses')
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
      const response = await api.post<{ status: string; data: Address }>('/api/student/addresses', data)
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
      const response = await api.put<{ status: string; data: Address }>(`/api/student/addresses/${id}`, data)
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
      await api.delete(`/api/student/addresses/${id}`)
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
    settingsLoading,
    settingsError,
    getSettings,
    updateSettings,

    // Password
    changePasswordLoading,
    changePasswordError,
    changePassword,

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

