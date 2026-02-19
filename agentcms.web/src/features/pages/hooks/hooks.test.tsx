import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePages } from './usePages'
import { useUpdatePage } from './useUpdatePage'
import { useTogglePublish } from './useTogglePublish'
import { pagesApi } from '../api'
import type { Page } from '../types'

vi.mock('../api', () => ({
  pagesApi: {
    getAll: vi.fn(),
    update: vi.fn(),
    togglePublish: vi.fn(),
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

describe('usePages', () => {
  it('fetches pages successfully', async () => {
    const mockPages: Page[] = [
      {
        id: '1',
        siteId: 'site-1',
        title: 'Test Page',
        body: 'Content',
        isPublished: false,
        createdDate: '2026-01-01',
        updatedDate: '2026-01-01',
        lastModified: '2026-01-01T00:00:00Z',
        createdBy: 'user1',
        updatedBy: 'user1',
      },
    ]
    vi.mocked(pagesApi.getAll).mockResolvedValueOnce(mockPages)

    const { result } = renderHook(() => usePages('site-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPages)
  })
})

describe('useTogglePublish', () => {
  it('toggles publish status successfully', async () => {
    const mockPage: Page = {
      id: '1',
      siteId: 'site-1',
      title: 'Test Page',
      body: null,
      isPublished: false,
      createdDate: '2026-01-01',
      updatedDate: '2026-01-01',
      lastModified: '2026-01-01T00:00:00Z',
      createdBy: 'user1',
      updatedBy: 'user1',
    }

    const toggledPage = { ...mockPage, isPublished: true }
    vi.mocked(pagesApi.togglePublish).mockResolvedValueOnce(toggledPage)

    const { result } = renderHook(() => useTogglePublish(), { wrapper: createWrapper() })

    result.current.mutate({ siteId: 'site-1', page: mockPage })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(toggledPage)
  })
})
