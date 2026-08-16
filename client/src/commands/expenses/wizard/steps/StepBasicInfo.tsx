import type { SearchPickerOption } from '../../../../components/ui'
import { SearchPickerModal } from '../../../../components/ui'
import { useCompanyId } from '../../../../hooks/useCompanyId'
import {
  getAccountingCategories,
  searchAccountingCategories,
} from '../../../accounting-categories/shared/categoryService'
import {
  getCostCenters,
  searchCostCenters,
} from '../../../cost-centers/shared/costCenterService'
import {
  getProviders,
  searchProviders,
} from '../../../providers/shared/providerService'

interface StepBasicInfoProps {
  title: string
  expenseDate: string
  providerId: string
  providerName: string
  categoryId: string
  accountancyCategoryName: string
  costCenterId: string
  costCenterName: string
  onUpdate: (data: {
    title?: string
    expenseDate?: string
    providerId?: string
    providerName?: string
    categoryId?: string
    accountancyCategoryName?: string
    costCenterId?: string
    costCenterName?: string
  }) => void
}

export function StepBasicInfo({
  title,
  expenseDate,
  providerId,
  providerName,
  categoryId,
  accountancyCategoryName,
  costCenterId,
  costCenterName,
  onUpdate,
}: StepBasicInfoProps) {
  const companyId = useCompanyId()

  const searchProviderOptions = async (
    query: string,
  ): Promise<SearchPickerOption[]> => {
    const results = await searchProviders(companyId!, query)
    return results.map((p) => ({
      value: p.id,
      label: p.name,
      subtitle: `NIT: ${p.nit}`,
    }))
  }

  const fetchAllProviders = async (): Promise<SearchPickerOption[]> => {
    const results = await getProviders(companyId!)
    return results.map((p) => ({
      value: p.id,
      label: p.name,
      subtitle: `NIT: ${p.nit}`,
    }))
  }

  const searchCategoryOptions = async (
    query: string,
  ): Promise<SearchPickerOption[]> => {
    const results = await searchAccountingCategories(companyId!, query)
    return results.map((c) => ({ value: c.id, label: c.name }))
  }

  const fetchAllCategories = async (): Promise<SearchPickerOption[]> => {
    const results = await getAccountingCategories(companyId!)
    return results.map((c) => ({ value: c.id, label: c.name }))
  }

  const searchCostCenterOptions = async (
    query: string,
  ): Promise<SearchPickerOption[]> => {
    const results = await searchCostCenters(companyId!, query)
    return results.map((cc) => ({ value: cc.id, label: cc.name }))
  }

  const fetchAllCostCenters = async (): Promise<SearchPickerOption[]> => {
    const results = await getCostCenters(companyId!)
    return results.map((cc) => ({ value: cc.id, label: cc.name }))
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="expense-title"
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          Título del gasto
        </label>
        <input
          id="expense-title"
          type="text"
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ej: Arriendo oficina enero 2026"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <div>
        <label
          htmlFor="expense-date"
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          Fecha del gasto
        </label>
        <input
          id="expense-date"
          type="date"
          value={expenseDate}
          onChange={(e) => onUpdate({ expenseDate: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <SearchPickerModal
        label="Proveedor"
        value={providerId}
        selectedLabel={providerName}
        onSearch={searchProviderOptions}
        onFetchAll={fetchAllProviders}
        onSelect={(option) =>
          onUpdate({ providerId: option.value, providerName: option.label })
        }
        placeholder="Buscar proveedor..."
        searchPlaceholder="Nombre, NIT o razón social"
        modalTitle="Seleccionar proveedor"
      />

      <SearchPickerModal
        label="Centro de costo"
        value={costCenterId}
        selectedLabel={costCenterName}
        onSearch={searchCostCenterOptions}
        onFetchAll={fetchAllCostCenters}
        onSelect={(option) =>
          onUpdate({ costCenterId: option.value, costCenterName: option.label })
        }
        placeholder="Buscar centro de costo..."
        searchPlaceholder="Nombre del centro de costo"
        modalTitle="Seleccionar centro de costo"
      />

      <SearchPickerModal
        label="Categoría contable"
        value={categoryId}
        selectedLabel={accountancyCategoryName}
        onSearch={searchCategoryOptions}
        onFetchAll={fetchAllCategories}
        onSelect={(option) =>
          onUpdate({
            categoryId: option.value,
            accountancyCategoryName: option.label,
          })
        }
        placeholder="Buscar categoría..."
        searchPlaceholder="Nombre de la categoría"
        modalTitle="Seleccionar categoría contable"
      />
    </div>
  )
}
