import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sitesApi } from '../api'
import { SITES_QUERY_KEY } from './useSites'
import type { CreateSiteDto, Site } from '../types'
import { getErrorMessage } from '@/query/client'

export function useCreateSite() {
  const queryClient = useQueryClient()

  return useMutation<Site, Error, CreateSiteDto>({
    mutationFn: sitesApi.create,
    onSuccess: () => {
      // Invalidate and refetch sites list
      queryClient.invalidateQueries({ queryKey: SITES_QUERY_KEY })
    },
    onError: (error) => {
      console.error('Failed to create site:', getErrorMessage(error))
    },
  })
}
