import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input, SlidePanel } from '../../components/ui'
import { useBankAccounts } from '../../hooks/useBankAccounts'
import { useCompanyId } from '../../hooks/useCompanyId'

export function BankAccountFindModal() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const { bankAccounts, isLoading } = useBankAccounts()
  const [query, setQuery] = useState('')

  // Pre-fill from query params if provided by command
  useEffect(() => {
    const queryParam = searchParams.get('query')
    if (queryParam) {
      setQuery(queryParam)
    }
  }, [searchParams])

  const filteredAccounts = query
    ? bankAccounts.filter((account) =>
        account.name.toLowerCase().includes(query.toLowerCase().trim()),
      )
    : bankAccounts

  return (
    <SlidePanel title="Buscar cuenta bancaria">
      <div className="space-y-4">
        <Input
          label="Buscar por nombre"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ej: Bancolombia"
          autoFocus
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium normal-case">
              {filteredAccounts.length} resultado
              {filteredAccounts.length !== 1 ? 's' : ''}
            </div>

            {filteredAccounts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No se encontraron cuentas bancarias
              </p>
            ) : (
              <div className="space-y-2">
                {filteredAccounts.map((account) => (
                  <Link
                    key={account.id}
                    to={`/${companyId}/accountancy/bank-accounts?modal=bankAccount&mode=view&id=${account.id}`}
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {account.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <FileText className="h-3 w-3" />
                          <span>
                            {account.statements?.length || 0} extracto
                            {account.statements?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>
    </SlidePanel>
  )
}
