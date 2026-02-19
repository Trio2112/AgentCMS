import React, { useState } from 'react'
import { usePages } from '../hooks/usePages'
import { useCreatePage } from '../hooks/useCreatePage'
import { useUpdatePage } from '../hooks/useUpdatePage'
import { useDeletePage } from '../hooks/useDeletePage'
import { useTogglePublish } from '../hooks/useTogglePublish'
import { useSites } from '@features/sites/hooks/useSites'
import { PageList } from '../components/PageList'
import { PageEditor } from '../components/PageEditor'
import { Modal } from '@components/Modal'
import { ConfirmDialog } from '@components/ConfirmDialog'
import { useToast } from '@components/Toast'
import { getErrorMessage } from '@/query/client'
import type { Page } from '../types'
import type { PageFormData } from '../schemas'

export const PagesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | undefined>(undefined)
  const [deletingPage, setDeletingPage] = useState<Page | undefined>(undefined)
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')

  const { showToast } = useToast()
  const { data: sites = [] } = useSites()
  const { data: pages = [], isLoading } = usePages(selectedSiteId || sites[0]?.id || '')
  const createMutation = useCreatePage()
  const updateMutation = useUpdatePage()
  const deleteMutation = useDeletePage()
  const togglePublishMutation = useTogglePublish()

  const handleCreate = () => {
    setEditingPage(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setIsFormOpen(true)
  }

  const handleDelete = (page: Page) => {
    setDeletingPage(page)
  }

  const handleTogglePublish = async (page: Page) => {
    try {
      await togglePublishMutation.mutateAsync({ siteId: page.siteId, page })
      showToast(
        page.isPublished ? 'Page unpublished successfully' : 'Page published successfully',
        'success'
      )
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  const handleFormSubmit = async (data: PageFormData & { lastModified?: string }) => {
    try {
      if (editingPage) {
        await updateMutation.mutateAsync({
          siteId: editingPage.siteId,
          id: editingPage.id,
          data: {
            title: data.title,
            body: data.body,
            isPublished: data.isPublished,
            lastModified: data.lastModified!,
          },
        })
        showToast('Page updated successfully', 'success')
      } else {
        await createMutation.mutateAsync({
          siteId: data.siteId,
          data: {
            title: data.title,
            body: data.body,
            isPublished: data.isPublished,
          },
        })
        showToast('Page created successfully', 'success')
      }
      setIsFormOpen(false)
      setEditingPage(undefined)
    } catch (error) {
      // Let PageEditor handle concurrent edit errors
      if (editingPage) {
        throw error
      }
      showToast(getErrorMessage(error), 'error')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingPage) return

    try {
      await deleteMutation.mutateAsync({ siteId: deletingPage.siteId, pageId: deletingPage.id })
      showToast('Page deleted successfully', 'success')
      setDeletingPage(undefined)
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
        <p className="mt-2 text-gray-600">Create and manage your website pages.</p>
      </div>

      <PageList
        pages={pages}
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSiteFilterChange={setSelectedSiteId}
        loading={isLoading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingPage(undefined)
        }}
        title={editingPage ? 'Edit Page' : 'Create Page'}
        size="lg"
      >
        <PageEditor
          page={editingPage}
          sites={sites}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingPage(undefined)
          }}
          onTogglePublish={editingPage ? handleTogglePublish : undefined}
          loading={createMutation.isPending || updateMutation.isPending}
          error={updateMutation.error}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingPage}
        onClose={() => setDeletingPage(undefined)}
        onConfirm={handleConfirmDelete}
        title="Delete Page"
        message={
          <>
            Are you sure you want to delete <strong>{deletingPage?.title}</strong>? This action cannot be undone.
          </>
        }
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
