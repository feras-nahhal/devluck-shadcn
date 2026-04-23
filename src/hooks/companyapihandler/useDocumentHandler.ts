"use client"

import { api } from '@/lib/api'
import { useCallback, useState } from 'react'


export interface Document {
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
    companyId: string
    createdAt: string
    updatedAt: string
}

interface UseDocumentHandlerReturn {
    documents: Document[]
    documentsLoading: boolean
    documentsError: string | null
    getDocuments: (companyId?: string) => Promise<Document[]>  // ✅ accept companyId
    uploadDocument: (file: File, onProgress?: (progress: number) => void) => Promise<Document>
    uploadLoading: boolean
    uploadError: string | null
    deleteDocument: (id: string) => Promise<void>
    deleteLoading: boolean
    deleteError: string | null
    clearError: () => void
}

export const useDocumentHandler = (): UseDocumentHandlerReturn => {
    const [documents, setDocuments] = useState<Document[]>([])
    const [documentsLoading, setDocumentsLoading] = useState(false)
    const [documentsError, setDocumentsError] = useState<string | null>(null)

    const [uploadLoading, setUploadLoading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const clearError = useCallback(() => {
        setDocumentsError(null)
        setUploadError(null)
        setDeleteError(null)
    }, [])

    const getDocuments = useCallback(async (companyId?: string): Promise<Document[]> => {
        setDocumentsLoading(true)
        setDocumentsError(null)
        try {
            const url = companyId ? `/api/company/documents?companyId=${companyId}` : '/api/company/documents';
            console.log('Fetching documents from:', url);
            const response = await api.get<{ status: string; data: Document[] }>(url)
            console.log('Documents API response:', response.data);
            setDocuments(response.data.data)
            return response.data.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to get documents'
            console.error('Documents API error:', err.response || err);
            setDocumentsError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setDocumentsLoading(false)
        }
    }, [])




    const uploadDocument = useCallback(
        async (file: File, onProgress?: (progress: number) => void): Promise<Document> => {
            console.log('🚀 API Hook: uploadDocument called for:', file.name);
            setUploadLoading(true)
            setUploadError(null)
            try {
                const formData = new FormData()
                formData.append('file', file)

                console.log('🚀 API Hook: Making POST request to /api/company/documents');
                const response = await api.post<{ status: string; data: Document }>(
                    '/api/company/documents',
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total && onProgress) {
                                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                                onProgress(progress)
                            }
                        }
                    }
                )

                console.log('🚀 API Hook: Upload successful, response:', response.data.data);
                setDocuments((prev) => [response.data.data, ...prev])
                return response.data.data
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to upload document'
                setUploadError(errorMessage)
                throw new Error(errorMessage)
            } finally {
                setUploadLoading(false)
            }
        },
        []
    )

    const deleteDocument = useCallback(async (id: string): Promise<void> => {
        setDeleteLoading(true)
        setDeleteError(null)
        try {
            await api.delete(`/api/company/documents/${id}`)
            setDocuments((prev) => prev.filter((doc) => doc.id !== id))
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete document'
            setDeleteError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setDeleteLoading(false)
        }
    }, [])

    return {
        documents,
        documentsLoading,
        documentsError,
        getDocuments,
        uploadDocument,
        uploadLoading,
        uploadError,
        deleteDocument,
        deleteLoading,
        deleteError,
        clearError
    }
}


