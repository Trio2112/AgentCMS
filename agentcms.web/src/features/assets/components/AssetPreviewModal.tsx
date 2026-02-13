import React from 'react'
import type { Asset } from '../types'
import { Modal } from '@components/Modal'
import { Button } from '@components/Button'

interface AssetPreviewModalProps {
  asset: Asset | null
  isOpen: boolean
  onClose: () => void
}

export const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({ asset, isOpen, onClose }) => {
  if (!asset) return null

  const isImage = asset.mimeType.startsWith('image/')
  const isVideo = asset.mimeType.startsWith('video/')
  const isPdf = asset.mimeType === 'application/pdf'

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={asset.fileName} size="xl">
      <div className="space-y-4">
        {/* Preview */}
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
          {isImage && (
            <img
              src={asset.url}
              alt={asset.fileName}
              className="max-h-[500px] max-w-full object-contain"
            />
          )}
          {isVideo && (
            <video controls className="max-h-[500px] max-w-full">
              <source src={asset.url} type={asset.mimeType} />
              Your browser does not support the video tag.
            </video>
          )}
          {isPdf && (
            <iframe
              src={asset.url}
              className="w-full h-[500px] border-0"
              title={asset.fileName}
            />
          )}
          {!isImage && !isVideo && !isPdf && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <Button onClick={() => window.open(asset.url, '_blank')}>Download File</Button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-700">File Size</dt>
              <dd className="text-gray-600">{formatFileSize(asset.fileSize)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">File Type</dt>
              <dd className="text-gray-600">{asset.mimeType}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Uploaded</dt>
              <dd className="text-gray-600">{new Date(asset.uploadDate).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Uploaded By</dt>
              <dd className="text-gray-600">{asset.uploadedBy}</dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(asset.url)
            }}
          >
            Copy URL
          </Button>
          <Button onClick={() => window.open(asset.url, '_blank')}>Download</Button>
        </div>
      </div>
    </Modal>
  )
}
