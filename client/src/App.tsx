import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout'
import { AuthProvider, LoginPage, ProtectedRoute } from './features/auth'
import { ChatPage } from './features/chat'
import { CompanySelector, CreateCompanyPage } from './features/company'
import { ExpenseDetail, ExpenseForm, ExpenseList } from './features/expenses'
import { ProviderList } from './features/providers'
import { CostCentersPage } from './pages/CostCentersPage'
import { HomePage } from './pages/HomePage'
import { PaymentAccountsPage } from './pages/PaymentAccountsPage'

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
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ChatPage />} />
            <Route path="dashboard" element={<HomePage />} />
            <Route path="expenses" element={<ExpenseList />} />
            <Route path="expenses/new" element={<ExpenseForm />} />
            <Route path="expenses/:id" element={<ExpenseDetail />} />
            <Route path="providers" element={<ProviderList />} />
            <Route path="cost-centers" element={<CostCentersPage />} />
            <Route path="accounts" element={<PaymentAccountsPage />} />
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
