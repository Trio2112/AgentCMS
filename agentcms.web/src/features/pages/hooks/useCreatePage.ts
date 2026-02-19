import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pagesApi } from '../api'
import { PAGES_QUERY_KEY } from './usePages'
import type { CreatePageDto, Page } from '../types'
import { getErrorMessage } from '@/query/client'

interface CreatePageParams {
  siteId: string
  data: CreatePageDto
}

export function useCreatePage() {
  const queryClient = useQueryClient()

  return useMutation<Page, Error, CreatePageParams>({
    mutationFn: ({ siteId, data }) => pagesApi.create(siteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY })
    },
    onError: (error) => {
      console.error('Failed to create page:', getErrorMessage(error))
    },
  })
}
