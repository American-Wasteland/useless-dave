export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: (companyId: string) => [...providerKeys.lists(), companyId] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (companyId: string, providerId: string) =>
    [...providerKeys.details(), companyId, providerId] as const,
}
