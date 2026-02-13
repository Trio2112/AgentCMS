import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pagesApi } from '../api'
import { PAGES_QUERY_KEY } from './usePages'
import type { Page } from '../types'
import { getErrorMessage } from '@/query/client'

interface DeletePageContext {
  previousPages?: Page[]
}

export function useDeletePage() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string, DeletePageContext>({
    mutationFn: pagesApi.delete,
    onMutate: async (pageId) => {
      await queryClient.cancelQueries({ queryKey: PAGES_QUERY_KEY })
      const previousPages = queryClient.getQueryData<Page[]>(PAGES_QUERY_KEY)

      if (previousPages) {
        queryClient.setQueryData<Page[]>(
          PAGES_QUERY_KEY,
          previousPages.filter((page) => page.id !== pageId)
        )
      }

      return { previousPages }
    },
    onError: (error, _pageId, context) => {
      if (context?.previousPages) {
        queryClient.setQueryData(PAGES_QUERY_KEY, context.previousPages)
      }
      console.error('Failed to delete page:', getErrorMessage(error))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY })
    },
  })
}
