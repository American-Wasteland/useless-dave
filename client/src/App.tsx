import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChatLayout } from './components/layout'
import { AuthProvider, LoginPage, ProtectedRoute } from './features/auth'
import { CommandInterface } from './features/commands/CommandInterface'
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

          {/* Company-scoped routes - Command interface */}
          <Route
            path="/:companyId"
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
          >
            {/* Command interface is always rendered, panels overlay via Outlet */}
            <Route element={<CommandInterface />}>
              <Route index element={null} />
              <Route path="categories" element={<CategoriesPanel />} />
              <Route
                path="categories/create"
                element={<div>Create category page</div>}
              />
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
