import apiClient from '@api/client'
import type { Site, CreateSiteDto, UpdateSiteDto } from '@/types/api'

const BASE_PATH = '/v1/sites'

export const sitesApi = {
  getAll: async (): Promise<Site[]> => {
    const response = await apiClient.get<Site[]>(BASE_PATH)
    return response.data
  },

  getById: async (id: string): Promise<Site> => {
    const response = await apiClient.get<Site>(`${BASE_PATH}/${id}`)
    return response.data
  },

  create: async (data: CreateSiteDto): Promise<Site> => {
    const response = await apiClient.post<Site>(BASE_PATH, data)
    return response.data
  },

  update: async (id: string, data: UpdateSiteDto): Promise<Site> => {
    const response = await apiClient.put<Site>(`${BASE_PATH}/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`)
  },
}
