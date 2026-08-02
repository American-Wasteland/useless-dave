export const accountingCategoryKeys = {
  all: ['accountingCategories'] as const,
  lists: () => [...accountingCategoryKeys.all, 'list'] as const,
  list: (companyId: string) =>
    [...accountingCategoryKeys.lists(), companyId] as const,
}
