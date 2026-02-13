import { useQuery } from '@tanstack/react-query'
import { pagesApi } from '../api'
import type { Page } from '../types'

export function usePage(id: string | undefined) {
  return useQuery<Page, Error>({
    queryKey: ['pages', id],
    queryFn: () => pagesApi.getById(id!),
    enabled: !!id,
  })
}
