import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assetsApi } from '../api'
import { ASSETS_QUERY_KEY } from './useAssets'
import type { Asset } from '../types'
import { getErrorMessage } from '@/query/client'

interface DeleteAssetContext {
  previousAssets?: Asset[]
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string, DeleteAssetContext>({
    mutationFn: assetsApi.delete,
    onMutate: async (assetId) => {
      await queryClient.cancelQueries({ queryKey: ASSETS_QUERY_KEY })
      const previousAssets = queryClient.getQueryData<Asset[]>(ASSETS_QUERY_KEY)

      if (previousAssets) {
        queryClient.setQueryData<Asset[]>(
          ASSETS_QUERY_KEY,
          previousAssets.filter((asset) => asset.id !== assetId)
        )
      }

      return { previousAssets }
    },
    onError: (error, _assetId, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(ASSETS_QUERY_KEY, context.previousAssets)
      }
      console.error('Failed to delete asset:', getErrorMessage(error))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY })
    },
  })
}
