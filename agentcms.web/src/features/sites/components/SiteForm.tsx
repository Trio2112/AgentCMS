import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { siteSchema, type SiteFormData } from '@/schemas'
import type { Site } from '../types'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { useKeyboardShortcuts, KeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface SiteFormProps {
  site?: Site
  onSubmit: (data: SiteFormData) => void
  onCancel: () => void
  loading?: boolean
}

export const SiteForm: React.FC<SiteFormProps> = ({ site, onSubmit, onCancel, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: site?.name || '',
      description: site?.description || '',
    },
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      KeyboardShortcuts.save(() => {
        handleSubmit(onSubmit)()
      }),
    ],
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Site Name"
        {...register('name')}
        error={errors.name?.message}
        required
        placeholder="Enter site name"
        autoFocus
      />

      <Input
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Optional site description"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={!isDirty && !site}>
          {site ? 'Update Site' : 'Create Site'}
        </Button>
      </div>
    </form>
  )
}
