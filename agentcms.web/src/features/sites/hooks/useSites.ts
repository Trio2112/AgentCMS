import { useQuery } from '@tanstack/react-query'
import { sitesApi } from '../api'
import type { Site } from '../types'

export const SITES_QUERY_KEY = ['sites']

export function useSites() {
  return useQuery<Site[], Error>({
    queryKey: SITES_QUERY_KEY,
    queryFn: sitesApi.getAll,
  })
}
