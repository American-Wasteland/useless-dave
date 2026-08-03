import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ListCategoriesPage } from './commands/accounting-categories'
import { ListBankAccountsPage } from './commands/bank-accounts/list/ListPage'
import { ListCostCentersPage } from './commands/cost-centers'
import { ListProvidersPage } from './commands/providers'
import { ChatLayout } from './components/layout'
import { ModalManager } from './components/modals/ModalManager'
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
                <ModalManager />
                <ChatLayout />
              </ProtectedRoute>
            }
          >
            {/* Full pages (no command interface) */}
            <Route
              path="accountancy/categories"
              element={<ListCategoriesPage />}
            />
            <Route
              path="accountancy/bank-accounts"
              element={<ListBankAccountsPage />}
            />
            <Route
              path="accountancy/cost-centers"
              element={<ListCostCentersPage />}
            />
            <Route
              path="accountancy/providers"
              element={<ListProvidersPage />}
            />

            {/* Command interface is always rendered, panels overlay via Outlet */}
            <Route element={<CommandInterface />}>
              <Route index element={null} />
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
