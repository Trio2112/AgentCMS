import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pageSchema, type PageFormData } from '../schemas'
import type { Page } from '../types'
import type { Site } from '@features/sites/types'
import { Input } from '@components/Input'
import { TextArea } from '@components/TextArea'
import { Select } from '@components/Select'
import { Button } from '@components/Button'
import { ConfirmDialog } from '@components/ConfirmDialog'
import { AxiosError } from 'axios'
import { useKeyboardShortcuts, KeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface PageEditorProps {
  page?: Page
  sites: Site[]
  onSubmit: (data: PageFormData & { lastModified?: string }) => Promise<void>
  onCancel: () => void
  onTogglePublish?: (page: Page) => void
  loading?: boolean
  error?: Error | null
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  sites,
  onSubmit,
  onCancel,
  onTogglePublish,
  loading,
  error,
}) => {
  const [showConcurrencyWarning, setShowConcurrencyWarning] = useState(false)
  const [pendingData, setPendingData] = useState<PageFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      siteId: page?.siteId || '',
      title: page?.title || '',
      body: page?.body || '',
      isPublished: page?.isPublished || false,
    },
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      KeyboardShortcuts.save(() => {
        handleSubmit(handleFormSubmit)()
      }),
    ],
  })

  // Check for concurrent edit conflict (HTTP 409)
  useEffect(() => {
    if (error instanceof AxiosError && error.response?.status === 409) {
      setShowConcurrencyWarning(true)
    }
  }, [error])

  const handleFormSubmit = async (data: PageFormData) => {
    try {
      await onSubmit({
        ...data,
        ...(page && { lastModified: page.lastModified }),
      })
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 409) {
        setPendingData(data)
        setShowConcurrencyWarning(true)
      }
      throw err
    }
  }

  const handleForceUpdate = async () => {
    if (!pendingData) return

    // Retry without lastModified check (force update)
    try {
      await onSubmit(pendingData)
      setShowConcurrencyWarning(false)
      setPendingData(null)
    } catch (err) {
      console.error('Force update failed:', err)
    }
  }

  const handleDiscardChanges = () => {
    setShowConcurrencyWarning(false)
    setPendingData(null)
    if (page) {
      reset({
        siteId: page.siteId,
        title: page.title,
        body: page.body,
        isPublished: page.isPublished,
      })
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Site"
          {...register('siteId')}
          options={sites.map((site) => ({ value: site.id, label: site.name }))}
          error={errors.siteId?.message}
          required
          disabled={!!page}
          placeholder="Select a site"
        />

        <Input
          label="Page Title"
          {...register('title')}
          error={errors.title?.message}
          required
          placeholder="Enter page title"
          autoFocus
        />

        <TextArea
          label="Page Body"
          {...register('body')}
          error={errors.body?.message}
          placeholder="Enter page content"
          rows={10}
          maxLength={65535}
          showCharCount
        />

        {page && (
          <div className="flex items-center space-x-4 pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Status:</span>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                page.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {page.isPublished ? 'Published' : 'Draft'}
            </span>
            {onTogglePublish && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onTogglePublish(page)}
              >
                {page.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
            )}
          </div>
        )}

        {page && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            <p>Last updated: {new Date(page.updatedDate).toLocaleString()}</p>
            <p>Updated by: {page.updatedBy}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={(!isDirty && !!page) || loading}>
            {page ? 'Save Changes' : 'Create Page'}
          </Button>
        </div>
      </form>

      {/* Concurrent Edit Warning */}
      <ConfirmDialog
        isOpen={showConcurrencyWarning}
        onClose={handleDiscardChanges}
        onConfirm={handleForceUpdate}
        title="Page Modified by Another User"
        message={
          <div className="text-left">
            <p className="mb-2">
              This page has been modified by another user since you started editing.
            </p>
            <p className="mb-4 font-semibold">What would you like to do?</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Overwrite:</strong> Save your changes and overwrite the other user's changes</li>
              <li><strong>Discard:</strong> Reload the page and lose your changes</li>
            </ul>
          </div>
        }
        confirmText="Overwrite Changes"
        cancelText="Discard My Changes"
        variant="warning"
        loading={loading}
      />
    </>
  )
}
