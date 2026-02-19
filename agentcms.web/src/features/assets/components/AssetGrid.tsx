import React, { useState } from 'react'
import type { Asset } from '../types'
import type { Site } from '@features/sites/types'
import { Button } from '@components/Button'
import { Select } from '@components/Select'
import { SkeletonGridItem } from '@components/Skeleton'

interface AssetGridProps {
  assets: Asset[]
  sites: Site[]
  selectedSiteId?: string
  onSiteFilterChange: (siteId: string) => void
  loading?: boolean
  onDelete: (asset: Asset) => void
  onPreview: (asset: Asset) => void
  onUpload: () => void
}

// Helper to get asset download URL from API
const getAssetDownloadUrl = (asset: Asset): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  return `${apiBase}/v1/sites/${asset.siteId}/assets/${asset.id}/file`
}

export const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  sites,
  selectedSiteId,
  onSiteFilterChange,
  loading,
  onDelete,
  onPreview,
  onUpload,
}) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const filteredAssets = selectedSiteId
    ? assets.filter((asset) => asset.siteId === selectedSiteId)
    : assets

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || isNaN(bytes)) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️'
    } else if (mimeType.startsWith('video/')) {
      return '🎥'
    } else if (mimeType === 'application/pdf') {
      return '📄'
    }
    return '📎'
  }

  return (
    <div>
      {/* Header with filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">{filteredAssets.length} Assets</h2>
          <Select
            options={[
              { value: '', label: 'All Sites' },
              ...sites.map((site) => ({ value: site.id, label: site.name })),
            ]}
            value={selectedSiteId || ''}
            onChange={(e) => onSiteFilterChange(e.target.value)}
            className="w-64"
            aria-label="Filter by site"
          />
        </div>
        <Button onClick={onUpload}>Upload Asset</Button>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assets</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a file.</p>
          <div className="mt-6">
            <Button onClick={onUpload}>Upload Asset</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            <>
              <SkeletonGridItem />
              <SkeletonGridItem />
              <SkeletonGridItem />
              <SkeletonGridItem />
            </>
          ) : (
            filteredAssets.map((asset) => {
              const site = sites.find((s) => s.id === asset.siteId)
              const isImage = asset.mimeType.startsWith('image/')
              const imageFailed = failedImages.has(asset.id)

              return (
                <div
                  key={asset.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail/Preview */}
                  <div
                    className="h-48 bg-gray-100 flex items-center justify-center cursor-pointer"
                    onClick={() => onPreview(asset)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onPreview(asset)
                    }
                  }}
                  aria-label={`Preview ${asset.filename}`}
                >
                  {isImage && !imageFailed ? (
                    <img
                      src={getAssetDownloadUrl(asset)}
                      alt={asset.filename}
                      className="max-h-full max-w-full object-contain"
                      onError={() => {
                        console.error('Failed to load image:', asset.filename, asset.id)
                        setFailedImages(prev => new Set(prev).add(asset.id))
                      }}
                    />
                  ) : (
                    <div className="text-6xl" aria-hidden="true">
                      {getFileIcon(asset.mimeType)}
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate mb-1" title={asset.filename}>
                    {asset.filename}
                  </h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{formatFileSize(asset.fileSize)}</p>
                    <p>{site?.name || 'Unknown site'}</p>
                    <p>{new Date(asset.createdDate).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => onPreview(asset)} className="flex-1">
                      View
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(asset)} className="flex-1">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )
            })
          )}
        </div>
      )}
    </div>
  )
}
