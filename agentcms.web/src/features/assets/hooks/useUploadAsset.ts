import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assetsApi } from '../api'
import { ASSETS_QUERY_KEY } from './useAssets'
import type { Asset } from '../types'
import { getErrorMessage } from '@/query/client'
import { useState } from 'react'

interface UploadAssetParams {
  siteId: string
  file: File
}

export function useUploadAsset() {
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const mutation = useMutation<Asset, Error, UploadAssetParams>({
    mutationFn: ({ siteId, file }) => {
      const fileId = `${file.name}-${Date.now()}`
      return assetsApi.upload(siteId, file, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY })
      setUploadProgress({})
    },
    onError: (error) => {
      console.error('Failed to upload asset:', getErrorMessage(error))
      setUploadProgress({})
    },
  })

  return {
    ...mutation,
    uploadProgress,
  }
}
