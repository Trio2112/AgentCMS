import apiClient from '@api/client'
import type { Asset } from '@types/api'

const BASE_PATH = '/v1/assets'

export const assetsApi = {
  getAll: async (siteId?: string): Promise<Asset[]> => {
    const params = siteId ? { siteId } : undefined
    const response = await apiClient.get<Asset[]>(BASE_PATH, { params })
    return response.data
  },

  getById: async (id: string): Promise<Asset> => {
    const response = await apiClient.get<Asset>(`${BASE_PATH}/${id}`)
    return response.data
  },

  upload: async (
    siteId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Asset> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('siteId', siteId)

    const response = await apiClient.post<Asset>(BASE_PATH, formData, {
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

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`)
  },
}
