import React, { useState } from 'react'
import { useSites } from '../hooks/useSites'
import { useCreateSite } from '../hooks/useCreateSite'
import { useUpdateSite } from '../hooks/useUpdateSite'
import { useDeleteSite } from '../hooks/useDeleteSite'
import { SiteList } from '../components/SiteList'
import { SiteForm } from '../components/SiteForm'
import { Modal } from '@components/Modal'
import { ConfirmDialog } from '@components/ConfirmDialog'
import { useToast } from '@components/Toast'
import { getErrorMessage } from '@/query/client'
import type { Site } from '../types'
import type { SiteFormData } from '@/schemas'

export const SitesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | undefined>(undefined)
  const [deletingSite, setDeletingSite] = useState<Site | undefined>(undefined)

  const { showToast } = useToast()
  const { data: sites = [], isLoading } = useSites()
  const createMutation = useCreateSite()
  const updateMutation = useUpdateSite()
  const deleteMutation = useDeleteSite()

  const handleCreate = () => {
    setEditingSite(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (site: Site) => {
    setEditingSite(site)
    setIsFormOpen(true)
  }

  const handleDelete = (site: Site) => {
    setDeletingSite(site)
  }

  const handleFormSubmit = async (data: SiteFormData) => {
    try {
      if (editingSite) {
        await updateMutation.mutateAsync({ id: editingSite.id, data })
        showToast('Site updated successfully', 'success')
      } else {
        await createMutation.mutateAsync(data)
        showToast('Site created successfully', 'success')
      }
      setIsFormOpen(false)
      setEditingSite(undefined)
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingSite) return

    try {
      await deleteMutation.mutateAsync(deletingSite.id)
      showToast('Site deleted successfully', 'success')
      setDeletingSite(undefined)
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
        <p className="mt-2 text-gray-600">Manage your websites and content collections.</p>
      </div>

      <SiteList
        sites={sites}
        loading={isLoading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingSite(undefined)
        }}
        title={editingSite ? 'Edit Site' : 'Create Site'}
      >
        <SiteForm
          site={editingSite}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingSite(undefined)
          }}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingSite}
        onClose={() => setDeletingSite(undefined)}
        onConfirm={handleConfirmDelete}
        title="Delete Site"
        message={
          <>
            Are you sure you want to delete <strong>{deletingSite?.name}</strong>? This action cannot be undone.
          </>
        }
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
