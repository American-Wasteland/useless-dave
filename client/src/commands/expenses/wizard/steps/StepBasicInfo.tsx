import { SearchableSelect } from '../../../../components/ui'
import { useCostCenters } from '../../../../hooks/useCostCenters'
import { useListCategories } from '../../../accounting-categories/list/useListCategories'
import { useListProviders } from '../../../providers/list/useListProviders'

interface StepBasicInfoProps {
  title: string
  expenseDate: string
  providerId: string
  categoryId: string
  costCenterId: string
  onUpdate: (data: {
    title?: string
    expenseDate?: string
    providerId?: string
    categoryId?: string
    costCenterId?: string
  }) => void
}

export function StepBasicInfo({
  title,
  expenseDate,
  providerId,
  categoryId,
  costCenterId,
  onUpdate,
}: StepBasicInfoProps) {
  const { providers, isLoading: isLoadingProviders } = useListProviders()
  const { categories, isLoading: isLoadingCategories } = useListCategories()
  const { costCenters, isLoading: isLoadingCostCenters } = useCostCenters()

  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: p.name,
    subtitle: `NIT: ${p.nit}`,
  }))

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const costCenterOptions = costCenters.map((cc) => ({
    value: cc.id,
    label: cc.name,
  }))

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

      <SearchableSelect
        label="Proveedor"
        value={providerId}
        onChange={(value) => onUpdate({ providerId: value })}
        options={providerOptions}
        placeholder="Seleccionar proveedor..."
        isLoading={isLoadingProviders}
      />

      <SearchableSelect
        label="Centro de costo"
        value={costCenterId}
        onChange={(value) => onUpdate({ costCenterId: value })}
        options={costCenterOptions}
        placeholder="Seleccionar centro de costo..."
        isLoading={isLoadingCostCenters}
      />

      <SearchableSelect
        label="Categoría contable"
        value={categoryId}
        onChange={(value) => onUpdate({ categoryId: value })}
        options={categoryOptions}
        placeholder="Seleccionar categoría..."
        isLoading={isLoadingCategories}
      />
    </div>
  )
}
