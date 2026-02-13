import React from 'react'
import type { Page } from '../types'
import { Button } from '@components/Button'
import { Select } from '@components/Select'
import { SkeletonTableRow } from '@components/Skeleton'
import type { Site } from '@features/sites/types'

interface PageListProps {
  pages: Page[]
  sites: Site[]
  selectedSiteId?: string
  onSiteFilterChange: (siteId: string) => void
  loading?: boolean
  onEdit: (page: Page) => void
  onDelete: (page: Page) => void
  onCreate: () => void
  onTogglePublish: (page: Page) => void
}

export const PageList: React.FC<PageListProps> = ({
  pages,
  sites,
  selectedSiteId,
  onSiteFilterChange,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onTogglePublish,
}) => {
  const filteredPages = selectedSiteId
    ? pages.filter((page) => page.siteId === selectedSiteId)
    : pages

  return (
    <div>
      {/* Header with filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">{filteredPages.length} Pages</h2>
          <Select
            options={[
              { value: '', label: 'All Sites' },
              ...sites.map((site) => ({ value: site.id, label: site.name })),
            ]}
            value={selectedSiteId || ''}
            onChange={(e) => onSiteFilterChange(e.target.value)}
            className="w-64"
            aria-label="Filter by site"
          />
        </div>
        <Button onClick={onCreate}>Create Page</Button>
      </div>

      {!loading && filteredPages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pages</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new page.</p>
          <div className="mt-6">
            <Button onClick={onCreate}>Create Page</Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <>
                  <SkeletonTableRow columns={5} />
                  <SkeletonTableRow columns={5} />
                  <SkeletonTableRow columns={5} />
                </>
              ) : (
                filteredPages.map((page) => {
                  const site = sites.find((s) => s.id === page.siteId)
                  return (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            page.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {page.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.updatedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => onTogglePublish(page)}
                        className={`${
                          page.isPublished ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                        }`}
                        aria-label={page.isPublished ? `Unpublish ${page.title}` : `Publish ${page.title}`}
                      >
                        {page.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => onEdit(page)}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label={`Edit ${page.title}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(page)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete ${page.title}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
