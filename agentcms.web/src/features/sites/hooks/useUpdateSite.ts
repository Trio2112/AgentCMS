import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sitesApi } from '../api'
import { SITES_QUERY_KEY } from './useSites'
import type { UpdateSiteDto, Site } from '../types'
import { getErrorMessage } from '@/query/client'

interface UpdateSiteParams {
  id: string
  data: UpdateSiteDto
}

export function useUpdateSite() {
  const queryClient = useQueryClient()

  return useMutation<Site, Error, UpdateSiteParams>({
    mutationFn: ({ id, data }) => sitesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: SITES_QUERY_KEY })

      // Snapshot previous value
      const previousSites = queryClient.getQueryData<Site[]>(SITES_QUERY_KEY)

      // Optimistically update
      if (previousSites) {
        queryClient.setQueryData<Site[]>(
          SITES_QUERY_KEY,
          previousSites.map((site) => (site.id === id ? { ...site, ...data } : site))
        )
      }

      return { previousSites }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousSites) {
        queryClient.setQueryData(SITES_QUERY_KEY, context.previousSites)
      }
      console.error('Failed to update site:', getErrorMessage(error))
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: SITES_QUERY_KEY })
    },
  })
}
