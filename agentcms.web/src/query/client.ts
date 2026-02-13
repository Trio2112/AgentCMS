import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import type { ProblemDetails } from '@types/api'
import { getErrorMessage as getErrorMessageUtil } from '@/utils/errorMessages'

// Default query options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof AxiosError && error.response?.status && error.response.status < 500) {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

// Helper to extract error message from API response
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const problemDetails = error.response?.data as ProblemDetails | undefined
    if (problemDetails?.detail) {
      return problemDetails.detail
    }
    if (problemDetails?.title) {
      return problemDetails.title
    }
    // Use utility function for standardized error messages
    return getErrorMessageUtil(error)
  }

  // Fallback to utility function
  return getErrorMessageUtil(error)
}

// Helper to format validation errors
export function formatValidationErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError) {
    const problemDetails = error.response?.data as ProblemDetails | undefined
    if (problemDetails?.errors) {
      // Flatten array of errors to single string per field
      return Object.entries(problemDetails.errors).reduce(
        (acc, [key, messages]) => {
          acc[key] = messages.join(', ')
          return acc
        },
        {} as Record<string, string>
      )
    }
  }
  return {}
}
