import { useSearchParams } from 'react-router-dom'
import { BankAccountCreateModal } from './BankAccountCreateModal'
import { BankAccountFindModal } from './BankAccountFindModal'
import { BankAccountUpdateModal } from './BankAccountUpdateModal'
import { BankAccountViewModal } from './BankAccountViewModal'

export function BankAccountModalManager() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const accountId = searchParams.get('id')

  switch (mode) {
    case 'create':
      return <BankAccountCreateModal />
    case 'find':
      return <BankAccountFindModal />
    case 'view':
      if (!accountId) return null
      return <BankAccountViewModal accountId={accountId} />
    case 'update':
      if (!accountId) return null
      return <BankAccountUpdateModal accountId={accountId} />
    default:
      return null
  }
}
