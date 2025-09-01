export const kpisQueryKeys = {
  all: ['eos-kpis'] as const,
  lists: () => [...kpisQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...kpisQueryKeys.lists(), filters] as const,
  details: () => [...kpisQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...kpisQueryKeys.details(), id] as const,
  values: () => [...kpisQueryKeys.all, 'values'] as const,
  valuesForWeek: (weekStartDate: string) => [...kpisQueryKeys.values(), weekStartDate] as const,
  trends: (kpiId: string) => [...kpisQueryKeys.all, 'trends', kpiId] as const,
};