export const rocksQueryKeys = {
  all: ['eos-rocks'] as const,
  lists: () => [...rocksQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...rocksQueryKeys.lists(), filters] as const,
  details: () => [...rocksQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...rocksQueryKeys.details(), id] as const,
};