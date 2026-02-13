import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSites } from './useSites'
import { useCreateSite } from './useCreateSite'
import { useUpdateSite } from './useUpdateSite'
import { useDeleteSite } from './useDeleteSite'
import { sitesApi } from '../api'
import type { Site } from '../types'

// Mock the API
vi.mock('../api', () => ({
  sitesApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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

describe('useSites', () => {
  it('fetches sites successfully', async () => {
    const mockSites: Site[] = [
      { id: '1', name: 'Test Site', description: 'Test description' },
    ]
    vi.mocked(sitesApi.getAll).mockResolvedValueOnce(mockSites)

    const { result } = renderHook(() => useSites(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockSites)
  })
})

describe('useCreateSite', () => {
  it('creates a site successfully', async () => {
    const newSite: Site = { id: '2', name: 'New Site', description: null }
    vi.mocked(sitesApi.create).mockResolvedValueOnce(newSite)

    const { result } = renderHook(() => useCreateSite(), { wrapper: createWrapper() })

    result.current.mutate({ name: 'New Site' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(newSite)
  })
})

describe('useUpdateSite', () => {
  it('updates a site successfully', async () => {
    const updatedSite: Site = { id: '1', name: 'Updated Site', description: 'Updated' }
    vi.mocked(sitesApi.update).mockResolvedValueOnce(updatedSite)

    const { result } = renderHook(() => useUpdateSite(), { wrapper: createWrapper() })

    result.current.mutate({ id: '1', data: { name: 'Updated Site', description: 'Updated' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(updatedSite)
  })
})

describe('useDeleteSite', () => {
  it('deletes a site successfully', async () => {
    vi.mocked(sitesApi.delete).mockResolvedValueOnce()

    const { result } = renderHook(() => useDeleteSite(), { wrapper: createWrapper() })

    result.current.mutate('1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
