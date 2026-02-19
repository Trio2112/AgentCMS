// API Response Types
export interface ProblemDetails {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  errors?: Record<string, string[]>
}

// Site Types
export interface Site {
  id: string
  name: string
  description: string | null
}

export interface CreateSiteDto {
  name: string
  description?: string | null
}

export interface UpdateSiteDto {
  name: string
  description?: string | null
}

// Page Types
export interface Page {
  id: string
  siteId: string
  title: string
  body: string | null
  isPublished: boolean
  createdDate: string
  updatedDate: string
  lastModified: string // For concurrent edit detection
  createdBy: string
  updatedBy: string
}

export interface CreatePageDto {
  siteId: string
  title: string
  body?: string | null
  isPublished?: boolean
}

export interface UpdatePageDto {
  title: string
  body?: string | null
  isPublished?: boolean
  lastModified: string // Required for concurrent edit detection
}

// Asset Types
export interface Asset {
  id: string
  siteId: string
  filename: string
  mimeType: string
  url: string
  createdDate: string
  createdBy: string | null
  // Optional properties not in spec but useful for frontend
  fileSize?: number
  thumbnailUrl?: string
}

export interface UploadAssetDto {
  siteId: string
  file: File
}

// API List Response
export interface ApiListResponse<T> {
  items: T[]
  total: number
  page?: number
  pageSize?: number
}

// Query Parameters
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SiteFilterParams extends PaginationParams {
  search?: string
}

export interface PageFilterParams extends PaginationParams {
  siteId?: string
  search?: string
  isPublished?: boolean
}

export interface AssetFilterParams extends PaginationParams {
  siteId?: string
  search?: string
  mimeType?: string
}
