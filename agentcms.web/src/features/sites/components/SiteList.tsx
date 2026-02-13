import React, { useState } from 'react'
import type { Site } from '../types'
import { Button } from '@components/Button'
import { SkeletonTableRow, SkeletonGridItem } from '@components/Skeleton'

interface SiteListProps {
  sites: Site[]
  loading?: boolean
  onEdit: (site: Site) => void
  onDelete: (site: Site) => void
  onCreate: () => void
}

type ViewMode = 'table' | 'grid'

export const SiteList: React.FC<SiteListProps> = ({ sites, loading, onEdit, onDelete, onCreate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  if (sites.length === 0) {
    return (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No sites</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new site.</p>
        <div className="mt-6">
          <Button onClick={onCreate}>Create Site</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with view toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{sites.length} Sites</h2>
        <div className="flex space-x-2">
          <div className="flex rounded-md shadow-sm" role="group" aria-label="View mode">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={viewMode === 'table'}
              aria-label="Table view"
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              Grid
            </button>
          </div>
          <Button onClick={onCreate}>Create Site</Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <>
                  <SkeletonTableRow columns={3} />
                  <SkeletonTableRow columns={3} />
                  <SkeletonTableRow columns={3} />
                </>
              ) : (
                sites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{site.description || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(site)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        aria-label={`Edit ${site.name}`}
                      >
                        Edit
                      </button>
                    <button
                      onClick={() => onDelete(site)}
                      className="text-red-600 hover:text-red-900"
                      aria-label={`Delete ${site.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              <SkeletonGridItem />
              <SkeletonGridItem />
              <SkeletonGridItem />
            </>
          ) : (
            sites.map((site) => (
              <div key={site.id} className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{site.name}</h3>
                <p className="text-sm text-gray-500 mb-4 h-12 overflow-hidden">{site.description || 'No description'}</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => onEdit(site)} className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(site)} className="flex-1">
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
          ))}
        </div>
      )}
    </div>
  )
}
