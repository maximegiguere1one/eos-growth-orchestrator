export const issuesQueryKeys = {
  all: ['eos-issues'] as const,
  lists: () => [...issuesQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...issuesQueryKeys.lists(), filters] as const,
  details: () => [...issuesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...issuesQueryKeys.details(), id] as const,
};