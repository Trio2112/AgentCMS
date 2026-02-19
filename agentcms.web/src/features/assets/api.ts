import apiClient from '@api/client'
import type { Asset } from '@/types/api'

export const assetsApi = {
  getAll: async (siteId: string): Promise<Asset[]> => {
    const response = await apiClient.get<Asset[]>(`/v1/sites/${siteId}/assets`)
    return response.data
  },

  getById: async (siteId: string, id: string): Promise<Asset> => {
    const response = await apiClient.get<Asset>(`/v1/sites/${siteId}/assets/${id}`)
    return response.data
  },

  upload: async (
    siteId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Asset> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<Asset>(`/v1/sites/${siteId}/assets`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      },
    })
    return response.data
  },

  delete: async (siteId: string, id: string): Promise<void> => {
    await apiClient.delete(`/v1/sites/${siteId}/assets/${id}`)
  },
}
