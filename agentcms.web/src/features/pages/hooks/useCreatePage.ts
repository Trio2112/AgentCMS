import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pagesApi } from '../api'
import { PAGES_QUERY_KEY } from './usePages'
import type { CreatePageDto, Page } from '../types'
import { getErrorMessage } from '@/query/client'

export function useCreatePage() {
  const queryClient = useQueryClient()

  return useMutation<Page, Error, CreatePageDto>({
    mutationFn: pagesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY })
    },
    onError: (error) => {
      console.error('Failed to create page:', getErrorMessage(error))
    },
  })
}
