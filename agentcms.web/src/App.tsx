import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { SitesPage } from './features/sites/pages/SitesPage'
import { PagesPage } from './features/pages/pages/PagesPage'
import { AssetsPage } from './features/assets/pages/AssetsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPlaceholder />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/pages" element={<PagesPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

// Placeholder components (will be replaced in Phase 3-5)
const DashboardPlaceholder = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to AgentCMS Admin Portal</h2>
    <p className="text-gray-600">Select a section from the navigation to get started.</p>
  </div>
)

export default App
