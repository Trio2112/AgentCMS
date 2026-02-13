import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pagesApi } from '../api'
import { PAGES_QUERY_KEY } from './usePages'
import type { UpdatePageDto, Page } from '../types'
import { getErrorMessage } from '@/query/client'
import { AxiosError } from 'axios'

interface UpdatePageParams {
  id: string
  data: UpdatePageDto
}

interface UpdatePageContext {
  previousPages?: Page[]
}

export function useUpdatePage() {
  const queryClient = useQueryClient()

  return useMutation<Page, Error, UpdatePageParams, UpdatePageContext>({
    mutationFn: ({ id, data }) => pagesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: PAGES_QUERY_KEY })
      const previousPages = queryClient.getQueryData<Page[]>(PAGES_QUERY_KEY)

      if (previousPages) {
        queryClient.setQueryData<Page[]>(
          PAGES_QUERY_KEY,
          previousPages.map((page) => (page.id === id ? { ...page, ...data } : page))
        )
      }

      return { previousPages }
    },
    onError: (error, _variables, context) => {
      // Check for concurrent edit conflict (HTTP 409)
      if (error instanceof AxiosError && error.response?.status === 409) {
        // Don't rollback - let the component handle the conflict
        console.warn('Concurrent edit detected')
      } else {
        // Rollback on other errors
        if (context?.previousPages) {
          queryClient.setQueryData(PAGES_QUERY_KEY, context.previousPages)
        }
        console.error('Failed to update page:', getErrorMessage(error))
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY })
    },
  })
}
