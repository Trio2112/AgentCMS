import { z } from 'zod'

// Site Schemas
export const siteSchema = z.object({
  name: z
    .string()
    .min(1, 'Site name is required')
    .max(255, 'Site name must be 255 characters or less')
    .trim(),
  description: z
    .string()
    .max(255, 'Description must be 255 characters or less')
    .nullable()
    .optional(),
})

export type SiteFormData = z.infer<typeof siteSchema>

// Page Schemas
export const pageSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  title: z
    .string()
    .min(1, 'Page title is required')
    .max(255, 'Page title must be 255 characters or less')
    .trim(),
  body: z
    .string()
    .max(65535, 'Page body must be 65535 characters or less')
    .nullable()
    .optional(),
  isPublished: z.boolean().optional().default(false),
})

export type PageFormData = z.infer<typeof pageSchema>

// Asset Upload Schemas
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
const ACCEPTED_DOCUMENT_TYPES = ['application/pdf']

export const assetUploadSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  file: z
    .custom<File>()
    .refine((file) => file instanceof File, 'File is required')
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 10MB')
    .refine(
      (file) =>
        [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_DOCUMENT_TYPES].includes(
          file.type
        ),
      'File type not supported. Accepted: images (JPEG, PNG, GIF, WebP), videos (MP4, WebM, OGG), PDF'
    ),
})

export type AssetUploadFormData = z.infer<typeof assetUploadSchema>

// Helper function for client-side file validation
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  if (
    ![...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_DOCUMENT_TYPES].includes(
      file.type
    )
  ) {
    return {
      valid: false,
      error: 'File type not supported. Accepted: images, videos (MP4, WebM, OGG), PDF',
    }
  }

  return { valid: true }
}

// Export constants for use in components
export const FILE_VALIDATION = {
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_TYPES: [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_DOCUMENT_TYPES],
} as const
