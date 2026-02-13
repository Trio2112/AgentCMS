import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload } from './FileUpload'

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(({ onDrop }) => ({
    getRootProps: () => ({
      onClick: () => {},
    }),
    getInputProps: () => ({}),
    isDragActive: false,
  })),
}))

describe('FileUpload', () => {
  const mockHandlers = {
    onFileSelect: vi.fn(),
  }

  it('renders upload area', () => {
    render(<FileUpload {...mockHandlers} />)
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument()
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
  })

  it('shows upload progress', () => {
    render(<FileUpload {...mockHandlers} loading uploadProgress={50} />)
    expect(screen.getByText('Uploading...')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('displays validation error', () => {
    render(<FileUpload {...mockHandlers} error="File too large" />)
    expect(screen.getByRole('alert')).toHaveTextContent('File too large')
  })

  it('shows file size limit', () => {
    render(<FileUpload {...mockHandlers} />)
    expect(screen.getByText(/up to 10MB/i)).toBeInTheDocument()
  })
})
