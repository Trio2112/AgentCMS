import { useQuery } from '@tanstack/react-query'
import { pagesApi } from '../api'
import type { Page } from '../types'

export const PAGES_QUERY_KEY = ['pages']

export function usePages(siteId: string) {
  return useQuery<Page[], Error>({
    queryKey: [...PAGES_QUERY_KEY, siteId],
    queryFn: () => pagesApi.getAll(siteId),
    enabled: !!siteId,
  })
}
