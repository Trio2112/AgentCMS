import React, { useState } from 'react'
import { useAssets } from '../hooks/useAssets'
import { useUploadAsset } from '../hooks/useUploadAsset'
import { useDeleteAsset } from '../hooks/useDeleteAsset'
import { useSites } from '@features/sites/hooks/useSites'
import { AssetGrid } from '../components/AssetGrid'
import { FileUpload } from '../components/FileUpload'
import { AssetPreviewModal } from '../components/AssetPreviewModal'
import { Modal } from '@components/Modal'
import { ConfirmDialog } from '@components/ConfirmDialog'
import { Select } from '@components/Select'
import { useToast } from '@components/Toast'
import { getErrorMessage } from '@/query/client'
import type { Asset } from '../types'

export const AssetsPage: React.FC = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadSiteId, setUploadSiteId] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | undefined>(undefined)
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')

  const { showToast } = useToast()
  const { data: sites = [] } = useSites()
  const { data: assets = [], isLoading } = useAssets(selectedSiteId || sites[0]?.id || '')
  const { mutateAsync: uploadAsset, isPending: isUploading, uploadProgress } = useUploadAsset()
  const deleteMutation = useDeleteAsset()

  const handleUpload = () => {
    setSelectedFile(null)
    setUploadSiteId('')
    setIsUploadOpen(true)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile || !uploadSiteId) {
      showToast('Please select a site and file', 'error')
      return
    }

    try {
      await uploadAsset({ siteId: uploadSiteId, file: selectedFile })
      showToast('Asset uploaded successfully', 'success')
      setIsUploadOpen(false)
      setSelectedFile(null)
      setUploadSiteId('')
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  const handleDelete = (asset: Asset) => {
    setDeletingAsset(asset)
  }

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return

    try {
      await deleteMutation.mutateAsync({ siteId: deletingAsset.siteId, assetId: deletingAsset.id })
      showToast('Asset deleted successfully', 'success')
      setDeletingAsset(undefined)
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  const handlePreview = (asset: Asset) => {
    setPreviewAsset(asset)
  }

  const currentProgress = Object.values(uploadProgress)[0] || 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
        <p className="mt-2 text-gray-600">Upload and manage media files for your websites.</p>
      </div>

      <AssetGrid
        assets={assets}
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSiteFilterChange={setSelectedSiteId}
        loading={isLoading}
        onUpload={handleUpload}
        onDelete={handleDelete}
        onPreview={handlePreview}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          if (!isUploading) {
            setIsUploadOpen(false)
            setSelectedFile(null)
            setUploadSiteId('')
          }
        }}
        title="Upload Asset"
      >
        <div className="space-y-4">
          <Select
            label="Site"
            options={sites.map((site) => ({ value: site.id, label: site.name }))}
            value={uploadSiteId}
            onChange={(e) => setUploadSiteId(e.target.value)}
            required
            placeholder="Select a site"
            disabled={isUploading}
          />

          <FileUpload
            onFileSelect={handleFileSelect}
            loading={isUploading}
            uploadProgress={currentProgress}
          />

          {selectedFile && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Selected:</span> {selectedFile.name}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsUploadOpen(false)
                setSelectedFile(null)
                setUploadSiteId('')
              }}
              disabled={isUploading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={!selectedFile || !uploadSiteId || isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <AssetPreviewModal
        asset={previewAsset}
        isOpen={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingAsset}
        onClose={() => setDeletingAsset(undefined)}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        message={
          <>
            Are you sure you want to delete <strong>{deletingAsset?.filename}</strong>? This action cannot be
            undone.
          </>
        }
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
