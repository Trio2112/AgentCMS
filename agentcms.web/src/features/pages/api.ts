import apiClient from '@api/client'
import type { Page, CreatePageDto, UpdatePageDto } from '@types/api'

const BASE_PATH = '/v1/pages'

export const pagesApi = {
  getAll: async (siteId?: string): Promise<Page[]> => {
    const params = siteId ? { siteId } : undefined
    const response = await apiClient.get<Page[]>(BASE_PATH, { params })
    return response.data
  },

  getById: async (id: string): Promise<Page> => {
    const response = await apiClient.get<Page>(`${BASE_PATH}/${id}`)
    return response.data
  },

  create: async (data: CreatePageDto): Promise<Page> => {
    const response = await apiClient.post<Page>(BASE_PATH, data)
    return response.data
  },

  update: async (id: string, data: UpdatePageDto): Promise<Page> => {
    const response = await apiClient.put<Page>(`${BASE_PATH}/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`)
  },

  togglePublish: async (id: string, currentPage: Page): Promise<Page> => {
    const response = await apiClient.put<Page>(`${BASE_PATH}/${id}`, {
      title: currentPage.title,
      body: currentPage.body,
      isPublished: !currentPage.isPublished,
      lastModified: currentPage.lastModified,
    })
    return response.data
  },
}
