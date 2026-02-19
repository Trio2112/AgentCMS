import { useQuery } from '@tanstack/react-query'
import { assetsApi } from '../api'
import type { Asset } from '../types'

export const ASSETS_QUERY_KEY = ['assets']

export function useAssets(siteId: string) {
  return useQuery<Asset[], Error>({
    queryKey: [...ASSETS_QUERY_KEY, siteId],
    queryFn: () => assetsApi.getAll(siteId),
    enabled: !!siteId,
  })
}
