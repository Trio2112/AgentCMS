/**
 * User-friendly error messages for common API errors
 * Maps HTTP status codes and error codes to readable messages
 */

export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This resource has been modified by another user. Please refresh and try again.',
  422: 'The data you provided is invalid. Please check the form and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An unexpected server error occurred. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again in a few moments.',
  503: 'The service is temporarily unavailable. Please try again later.',
  504: 'The request timed out. Please check your connection and try again.',
}

export const NETWORK_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  TIMEOUT: 'The request took too long. Please try again.',
  CORS_ERROR: 'Connection blocked by security policy. Please contact support.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
}

/**
 * API-specific error codes and messages
 */
export const API_ERROR_MESSAGES: Record<string, string> = {
  // Site errors
  SITE_NAME_EXISTS: 'A site with this name already exists.',
  SITE_DOMAIN_EXISTS: 'A site with this domain already exists.',
  SITE_NOT_FOUND: 'The site you are looking for does not exist.',
  SITE_HAS_PAGES: 'Cannot delete site that contains pages.',
  SITE_HAS_ASSETS: 'Cannot delete site that contains assets.',

  // Page errors
  PAGE_NOT_FOUND: 'The page you are looking for does not exist.',
  PAGE_TITLE_EXISTS: 'A page with this title already exists on this site.',
  PAGE_CONCURRENT_EDIT: 'This page was modified by another user. Your changes may be lost.',
  PAGE_BODY_TOO_LONG: 'Page content exceeds the maximum length of 65,535 characters.',

  // Asset errors
  ASSET_NOT_FOUND: 'The asset you are looking for does not exist.',
  ASSET_TOO_LARGE: 'File size exceeds the maximum limit of 10MB.',
  ASSET_INVALID_TYPE: 'Invalid file type. Only images, videos, and PDFs are allowed.',
  ASSET_UPLOAD_FAILED: 'File upload failed. Please try again.',
  ASSET_STORAGE_FULL: 'Storage quota exceeded. Please delete old files or contact support.',

  // Validation errors
  VALIDATION_ERROR: 'The data you provided is invalid.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please provide a valid email address.',
  INVALID_URL: 'Please provide a valid URL.',
  INVALID_DATE: 'Please provide a valid date.',

  // Authentication errors
  AUTH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_INVALID_TOKEN: 'Invalid authentication token. Please log in again.',
  AUTH_INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
}

/**
 * Get user-friendly error message from error object
 */
export const getErrorMessage = (error: unknown): string => {
  // Type guard for axios error
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: { code?: string; message?: string } } }
    
    // Check for API-specific error code
    const errorCode = axiosError.response?.data?.code
    if (errorCode && API_ERROR_MESSAGES[errorCode]) {
      return API_ERROR_MESSAGES[errorCode]
    }

    // Check for custom error message from API
    const apiMessage = axiosError.response?.data?.message
    if (apiMessage && typeof apiMessage === 'string') {
      return apiMessage
    }

    // Check for HTTP status code
    const status = axiosError.response?.status
    if (status && HTTP_ERROR_MESSAGES[status]) {
      return HTTP_ERROR_MESSAGES[status]
    }
  }

  // Check for network errors
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message.toLowerCase()
    if (message.includes('network')) {
      return NETWORK_ERROR_MESSAGES.NETWORK_ERROR
    }
    if (message.includes('timeout')) {
      return NETWORK_ERROR_MESSAGES.TIMEOUT
    }
    if (message.includes('cors')) {
      return NETWORK_ERROR_MESSAGES.CORS_ERROR
    }
  }

  // Fallback to generic error
  return NETWORK_ERROR_MESSAGES.UNKNOWN
}

/**
 * Format validation errors from API response
 */
export const formatValidationErrors = (errors: Record<string, string[]> | undefined): string => {
  if (!errors) return NETWORK_ERROR_MESSAGES.UNKNOWN

  const errorMessages = Object.entries(errors)
    .map(([field, messages]) => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1)
      return `${fieldName}: ${messages.join(', ')}`
    })
    .join('\n')

  return errorMessages || NETWORK_ERROR_MESSAGES.UNKNOWN
}

/**
 * Check if error is a specific type
 */
export const isErrorType = {
  notFound: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      return axiosError.response?.status === 404
    }
    return false
  },

  unauthorized: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      return axiosError.response?.status === 401
    }
    return false
  },

  conflict: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      return axiosError.response?.status === 409
    }
    return false
  },

  validation: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      return axiosError.response?.status === 422
    }
    return false
  },

  serverError: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      const status = axiosError.response?.status
      return status !== undefined && status >= 500 && status < 600
    }
    return false
  },

  networkError: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message: string }).message.toLowerCase()
      return message.includes('network') || message.includes('connection')
    }
    return false
  },
}
