import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  CreateCategoryPanel,
  FindCategoryPanel,
  ListCategoriesPage,
} from './commands/accounting-categories'
import { ChatLayout } from './components/layout'
import { AuthProvider, LoginPage, ProtectedRoute } from './features/auth'
import { CommandInterface } from './features/commands/CommandInterface'
import { CompanySelector, CreateCompanyPage } from './features/company'

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
            {/* Full pages (no command interface) */}
            <Route
              path="accountancy/categories"
              element={<ListCategoriesPage />}
            />

            {/* Command interface is always rendered, panels overlay via Outlet */}
            <Route element={<CommandInterface />}>
              <Route index element={null} />
              <Route path="categories" element={<FindCategoryPanel />} />
              <Route
                path="categories/create"
                element={<CreateCategoryPanel />}
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
