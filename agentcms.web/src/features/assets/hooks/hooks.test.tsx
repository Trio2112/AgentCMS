import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAssets } from './useAssets'
import { useUploadAsset } from './useUploadAsset'
import { useDeleteAsset } from './useDeleteAsset'
import { assetsApi } from '../api'
import type { Asset } from '../types'

vi.mock('../api', () => ({
  assetsApi: {
    getAll: vi.fn(),
    upload: vi.fn(),
    delete: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAssets', () => {
  it('fetches assets successfully', async () => {
    const mockAssets: Asset[] = [
      {
        id: '1',
        siteId: 'site-1',
        filename: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        createdDate: '2026-01-01',
        createdBy: 'user1',
        url: 'https://example.com/test.jpg',
      },
    ]
    vi.mocked(assetsApi.getAll).mockResolvedValueOnce(mockAssets)

    const { result } = renderHook(() => useAssets('site-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockAssets)
  })
})

describe('useDeleteAsset', () => {
  it('deletes an asset successfully', async () => {
    vi.mocked(assetsApi.delete).mockResolvedValueOnce()

    const { result } = renderHook(() => useDeleteAsset(), { wrapper: createWrapper() })

    result.current.mutate({ siteId: 'site-1', assetId: '1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
