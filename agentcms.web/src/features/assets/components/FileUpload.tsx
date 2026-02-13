import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { validateFile, FILE_VALIDATION } from '../validation'
import { Button } from '@components/Button'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  loading?: boolean
  uploadProgress?: number
  error?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  loading,
  uploadProgress,
  error,
}) => {
  const [validationError, setValidationError] = useState<string | undefined>()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setValidationError(undefined)

      if (acceptedFiles.length === 0) {
        setValidationError('No file selected')
        return
      }

      const file = acceptedFiles[0]!
      const validation = validateFile(file)

      if (!validation.valid) {
        setValidationError(validation.error)
        return
      }

      onFileSelect(file)
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: loading,
  })

  const displayError = error || validationError

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : displayError
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        role="button"
        aria-label="Upload file area"
      >
        <input {...getInputProps()} aria-label="File input" />
        
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-gray-600">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-sm text-blue-600 font-medium">Drop file here</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM, OGG), or PDF up to{' '}
                {FILE_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {loading && typeof uploadProgress === 'number' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
              role="progressbar"
              aria-valuenow={uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {displayError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
          <p className="text-sm text-red-800">{displayError}</p>
        </div>
      )}
    </div>
  )
}
