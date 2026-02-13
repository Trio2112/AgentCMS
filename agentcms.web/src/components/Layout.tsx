import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Home', path: '/' }]

    let currentPath = ''
    for (const segment of paths) {
      currentPath += `/${segment}`
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">AgentCMS Admin Portal</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-6 py-3">
            <li>
              <Link
                to="/"
                className={`px-3 py-2 rounded transition-colors ${
                  isActive('/') ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/sites"
                className={`px-3 py-2 rounded transition-colors ${
                  isActive('/sites') ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive('/sites') ? 'page' : undefined}
              >
                Sites
              </Link>
            </li>
            <li>
              <Link
                to="/pages"
                className={`px-3 py-2 rounded transition-colors ${
                  isActive('/pages') ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive('/pages') ? 'page' : undefined}
              >
                Pages
              </Link>
            </li>
            <li>
              <Link
                to="/assets"
                className={`px-3 py-2 rounded transition-colors ${
                  isActive('/assets') ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive('/assets') ? 'page' : undefined}
              >
                Assets
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <nav className="bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
          <div className="container mx-auto px-4 py-2">
            <ol className="flex space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.path} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-700 font-medium" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link to={crumb.path} className="text-blue-600 hover:underline">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} AgentCMS. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
