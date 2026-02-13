import { useQuery } from '@tanstack/react-query'
import { pagesApi } from '../api'
import type { Page } from '../types'

export const PAGES_QUERY_KEY = ['pages']

export function usePages(siteId?: string) {
  return useQuery<Page[], Error>({
    queryKey: siteId ? [...PAGES_QUERY_KEY, siteId] : PAGES_QUERY_KEY,
    queryFn: () => pagesApi.getAll(siteId),
  })
}
