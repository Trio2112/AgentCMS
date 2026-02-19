import apiClient from '@api/client'
import type { Page, CreatePageDto, UpdatePageDto } from '@/types/api'

export const pagesApi = {
  getAll: async (siteId: string): Promise<Page[]> => {
    const response = await apiClient.get<Page[]>(`/v1/sites/${siteId}/pages`)
    return response.data
  },

  getById: async (siteId: string, id: string): Promise<Page> => {
    const response = await apiClient.get<Page>(`/v1/sites/${siteId}/pages/${id}`)
    return response.data
  },

  create: async (siteId: string, data: CreatePageDto): Promise<Page> => {
    const response = await apiClient.post<Page>(`/v1/sites/${siteId}/pages`, data)
    return response.data
  },

  update: async (siteId: string, id: string, data: UpdatePageDto): Promise<Page> => {
    const response = await apiClient.put<Page>(`/v1/sites/${siteId}/pages/${id}`, data)
    return response.data
  },

  delete: async (siteId: string, id: string): Promise<void> => {
    await apiClient.delete(`/v1/sites/${siteId}/pages/${id}`)
  },

  togglePublish: async (siteId: string, id: string, currentPage: Page): Promise<Page> => {
    const response = await apiClient.put<Page>(`/v1/sites/${siteId}/pages/${id}`, {
      title: currentPage.title,
      body: currentPage.body,
      isPublished: !currentPage.isPublished,
      lastModified: currentPage.lastModified,
    })
    return response.data
  },
}
