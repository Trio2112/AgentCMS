import { useQuery } from '@tanstack/react-query'
import { pagesApi } from '../api'
import type { Page } from '../types'

export function usePage(siteId: string | undefined, id: string | undefined) {
  return useQuery<Page, Error>({
    queryKey: ['pages', siteId, id],
    queryFn: () => pagesApi.getById(siteId!, id!),
    enabled: !!siteId && !!id,
  })
}
