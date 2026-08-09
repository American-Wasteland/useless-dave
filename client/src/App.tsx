import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ListCategoriesPage } from './commands/accounting-categories'
import { CategoryCreatePage } from './commands/accounting-categories/create/CategoryCreatePage'
import { BankAccountCreatePage } from './commands/bank-accounts/create/BankAccountCreatePage'
import { ListBankAccountsPage } from './commands/bank-accounts/list/ListPage'
import { BankAccountEditPage } from './commands/bank-accounts/update/BankAccountEditPage'
import { BankAccountViewPage } from './commands/bank-accounts/view/BankAccountViewPage'
import { ListCostCentersPage } from './commands/cost-centers'
import { CostCenterCreatePage } from './commands/cost-centers/create/CostCenterCreatePage'
import { CostCenterEditPage } from './commands/cost-centers/update/CostCenterEditPage'
import { ListProvidersPage } from './commands/providers'
import { ProviderCreatePage } from './commands/providers/create/ProviderCreatePage'
import { ProviderEditPage } from './commands/providers/update/ProviderEditPage'
import { ProviderViewPage } from './commands/providers/view/ProviderViewPage'
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

          {/* Company-scoped routes */}
          <Route
            path="/:companyId"
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
          >
            {/* Accounting categories */}
            <Route
              path="accountancy/categories"
              element={<ListCategoriesPage />}
            />
            <Route
              path="accountancy/categories/create"
              element={<CategoryCreatePage />}
            />

            {/* Bank accounts */}
            <Route
              path="accountancy/bank-accounts"
              element={<ListBankAccountsPage />}
            />
            <Route
              path="accountancy/bank-accounts/create"
              element={<BankAccountCreatePage />}
            />
            <Route
              path="accountancy/bank-accounts/:accountId"
              element={<BankAccountViewPage />}
            />
            <Route
              path="accountancy/bank-accounts/:accountId/edit"
              element={<BankAccountEditPage />}
            />

            {/* Cost centers */}
            <Route
              path="accountancy/cost-centers"
              element={<ListCostCentersPage />}
            />
            <Route
              path="accountancy/cost-centers/create"
              element={<CostCenterCreatePage />}
            />
            <Route
              path="accountancy/cost-centers/:costCenterId/edit"
              element={<CostCenterEditPage />}
            />

            {/* Providers */}
            <Route
              path="accountancy/providers"
              element={<ListProvidersPage />}
            />
            <Route
              path="accountancy/providers/create"
              element={<ProviderCreatePage />}
            />
            <Route
              path="accountancy/providers/:providerId"
              element={<ProviderViewPage />}
            />
            <Route
              path="accountancy/providers/:providerId/edit"
              element={<ProviderEditPage />}
            />

            {/* Command interface (home) */}
            <Route element={<CommandInterface />}>
              <Route index element={null} />
            </Route>
          </Route>

          {/* Root redirect */}
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
