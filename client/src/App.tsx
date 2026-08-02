import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChatLayout } from './components/layout'
import { AuthProvider, LoginPage, ProtectedRoute } from './features/auth'
import { CommandView } from './features/commands/CommandView'
import { CommandPanel } from './features/commands/components'
import { CompanySelector, CreateCompanyPage } from './features/company'
import { CategoriesPanel } from './pages/panels/CategoriesPanel'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Company creation (new users) */}
          <Route
            path="/create-company"
            element={
              <ProtectedRoute>
                <CreateCompanyPage />
              </ProtectedRoute>
            }
          />

          {/* Company selector (multi-company users) */}
          <Route
            path="/select-company"
            element={
              <ProtectedRoute>
                <CompanySelector />
              </ProtectedRoute>
            }
          />

          {/* Company-scoped routes - Command-first layout */}
          <Route
            path="/:companyId"
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
          >
            {/* Command view is always rendered, panels overlay via Outlet */}
            <Route element={<CommandView />}>
              <Route index element={null} />
              <Route path="categories" element={<CategoriesPanel />} />
              {/* Command panels */}
              <Route path="comando/:commandId" element={<CommandPanel />} />
            </Route>
          </Route>

          {/* Root redirect - handled by ProtectedRoute */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/select-company" replace />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
