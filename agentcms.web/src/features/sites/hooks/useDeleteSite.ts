import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sitesApi } from '../api'
import { SITES_QUERY_KEY } from './useSites'
import type { Site } from '../types'
import { getErrorMessage } from '@/query/client'

export function useDeleteSite() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: sitesApi.delete,
    onMutate: async (siteId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: SITES_QUERY_KEY })

      // Snapshot previous value
      const previousSites = queryClient.getQueryData<Site[]>(SITES_QUERY_KEY)

      // Optimistically update
      if (previousSites) {
        queryClient.setQueryData<Site[]>(
          SITES_QUERY_KEY,
          previousSites.filter((site) => site.id !== siteId)
        )
      }

      return { previousSites }
    },
    onError: (error, _siteId, context) => {
      // Rollback on error
      if (context?.previousSites) {
        queryClient.setQueryData(SITES_QUERY_KEY, context.previousSites)
      }
      console.error('Failed to delete site:', getErrorMessage(error))
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: SITES_QUERY_KEY })
    },
  })
}
