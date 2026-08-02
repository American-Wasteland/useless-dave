import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout'
import { AuthProvider, LoginPage, ProtectedRoute } from './features/auth'
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
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/expenses/new" element={<ExpenseForm />} />
            <Route path="/expenses/:id" element={<ExpenseDetail />} />
            <Route path="/providers" element={<ProviderList />} />
            <Route path="/cost-centers" element={<CostCentersPage />} />
            <Route path="/accounts" element={<PaymentAccountsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
