import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input, SlidePanel } from '../../../components/ui'
import { useFindCategories } from './useFindCategories'

export function FindCategoryPanel() {
  const [searchParams] = useSearchParams()
  const { categories, isLoading } = useFindCategories()

  const initialQuery = searchParams.get('query') || ''
  const [query, setQuery] = useState(initialQuery)

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories

    const normalized = query.toLowerCase().trim()
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(normalized) ||
        cat.description?.toLowerCase().includes(normalized),
    )
  }, [categories, query])

  return (
    <SlidePanel title="Buscar categorías contables">
      <div className="space-y-4">
        <Input
          id="search"
          label="Buscar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe para filtrar..."
          icon={<Search className="h-4 w-4 text-gray-400" />}
          autoFocus
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {query.trim()
              ? 'No se encontraron categorías'
              : 'No hay categorías registradas'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {category.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="text-sm text-gray-500 text-center pt-2">
            {filteredCategories.length} categoría
            {filteredCategories.length !== 1 ? 's' : ''} encontrada
            {filteredCategories.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </SlidePanel>
  )
}
