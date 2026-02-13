import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pagesApi } from '../api'
import { PAGES_QUERY_KEY } from './usePages'
import type { Page } from '../types'
import { getErrorMessage } from '@/query/client'

export function useTogglePublish() {
  const queryClient = useQueryClient()

  return useMutation<Page, Error, Page>({
    mutationFn: (page) => pagesApi.togglePublish(page.id, page),
    onMutate: async (page) => {
      await queryClient.cancelQueries({ queryKey: PAGES_QUERY_KEY })
      const previousPages = queryClient.getQueryData<Page[]>(PAGES_QUERY_KEY)

      if (previousPages) {
        queryClient.setQueryData<Page[]>(
          PAGES_QUERY_KEY,
          previousPages.map((p) =>
            p.id === page.id ? { ...p, isPublished: !p.isPublished } : p
          )
        )
      }

      return { previousPages }
    },
    onError: (error, _page, context) => {
      if (context?.previousPages) {
        queryClient.setQueryData(PAGES_QUERY_KEY, context.previousPages)
      }
      console.error('Failed to toggle publish status:', getErrorMessage(error))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY })
    },
  })
}
