import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteList } from './SiteList'
import type { Site } from '../types'

describe('SiteList', () => {
  const mockSites: Site[] = [
    { id: '1', name: 'Site 1', description: 'Description 1' },
    { id: '2', name: 'Site 2', description: null },
  ]

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onCreate: vi.fn(),
  }

  it('renders empty state when no sites', () => {
    render(<SiteList sites={[]} {...mockHandlers} />)
    expect(screen.getByText(/no sites/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create site/i })).toBeInTheDocument()
  })

  it('renders sites in table view', () => {
    render(<SiteList sites={mockSites} {...mockHandlers} />)
    expect(screen.getByText('Site 1')).toBeInTheDocument()
    expect(screen.getByText('Site 2')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', async () => {
    const user = userEvent.setup()
    render(<SiteList sites={mockSites} {...mockHandlers} />)
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0]!)
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockSites[0])
  })

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    render(<SiteList sites={mockSites} {...mockHandlers} />)
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0]!)
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockSites[0])
  })

  it('toggles between table and grid view', async () => {
    const user = userEvent.setup()
    render(<SiteList sites={mockSites} {...mockHandlers} />)
    
    const gridButton = screen.getByRole('button', { name: /grid view/i })
    await user.click(gridButton)
    
    expect(gridButton).toHaveAttribute('aria-pressed', 'true')
  })
})
