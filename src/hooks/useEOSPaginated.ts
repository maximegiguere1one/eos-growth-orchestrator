import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EOSIssue, EOSRock, EOSTodo } from './useEOS';

export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  totalCount: number;
}

// Paginated issues hook for dashboard previews
export const useEOSIssuesPaginated = (page: number = 0, pageSize: number = 5) => {
  const start = page * pageSize;
  const end = start + pageSize - 1;

  return useQuery({
    queryKey: ['eos-issues-paginated', page, pageSize],
    queryFn: async (): Promise<PaginatedResult<EOSIssue>> => {
      const { data, error, count } = await supabase
        .from('eos_issues')
        .select('id, title, description, assigned_to, status, priority, resolved_at, archived_at, created_at, updated_at', { count: 'exact' })
        .is('archived_at', null)
        .eq('status', 'open') // Only open issues for dashboard
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .range(start, end);
      
      if (error) throw error;
      
      return {
        data: data as EOSIssue[],
        hasMore: (count || 0) > end + 1,
        totalCount: count || 0
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    refetchOnWindowFocus: false,
  });
};

// Paginated rocks hook for dashboard previews
export const useEOSRocksPaginated = (page: number = 0, pageSize: number = 5) => {
  const start = page * pageSize;
  const end = start + pageSize - 1;

  return useQuery({
    queryKey: ['eos-rocks-paginated', page, pageSize],
    queryFn: async (): Promise<PaginatedResult<EOSRock>> => {
      const { data, error, count } = await supabase
        .from('eos_rocks')
        .select('id, title, description, owner_id, start_date, due_date, progress, status, completed_at, archived_at, created_at, updated_at', { count: 'exact' })
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .range(start, end);
      
      if (error) throw error;
      
      return {
        data: data as EOSRock[],
        hasMore: (count || 0) > end + 1,
        totalCount: count || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - rocks change less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
};

// Paginated todos hook for dashboard previews
export const useEOSTodosPaginated = (page: number = 0, pageSize: number = 5) => {
  const start = page * pageSize;
  const end = start + pageSize - 1;

  return useQuery({
    queryKey: ['eos-todos-paginated', page, pageSize],
    queryFn: async (): Promise<PaginatedResult<EOSTodo>> => {
      const { data, error, count } = await supabase
        .from('eos_todos')
        .select('id, description, assigned_to, due_date, completed_at, archived_at, created_at, updated_at', { count: 'exact' })
        .is('archived_at', null)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .range(start, end);
      
      if (error) throw error;
      
      return {
        data: data as EOSTodo[],
        hasMore: (count || 0) > end + 1,
        totalCount: count || 0
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    refetchOnWindowFocus: false,
  });
};