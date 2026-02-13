import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageEditor } from './PageEditor'
import type { Site } from '@features/sites/types'

describe('PageEditor', () => {
  const mockSites: Site[] = [
    { id: 'site-1', name: 'Site 1', description: null },
    { id: 'site-2', name: 'Site 2', description: null },
  ]

  const mockHandlers = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  }

  it('renders create page form', () => {
    render(<PageEditor sites={mockSites} {...mockHandlers} />)
    expect(screen.getByLabelText(/page title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/page body/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create page/i })).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<PageEditor sites={mockSites} {...mockHandlers} />)

    await user.selectOptions(screen.getByLabelText(/site/i), 'site-1')
    await user.type(screen.getByLabelText(/page title/i), 'New Page')
    await user.type(screen.getByLabelText(/page body/i), 'Page content')

    await user.click(screen.getByRole('button', { name: /create page/i }))

    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith({
        siteId: 'site-1',
        title: 'New Page',
        body: 'Page content',
        isPublished: false,
      })
    })
  })

  it('shows validation errors', async () => {
    const user = userEvent.setup()
    render(<PageEditor sites={mockSites} {...mockHandlers} />)

    // Try to submit without required fields
    await user.click(screen.getByRole('button', { name: /create page/i }))

    expect(await screen.findByText(/page title is required/i)).toBeInTheDocument()
  })
})
