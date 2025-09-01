export const todosQueryKeys = {
  all: ['eos-todos'] as const,
  lists: () => [...todosQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...todosQueryKeys.lists(), filters] as const,
  details: () => [...todosQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...todosQueryKeys.details(), id] as const,
};