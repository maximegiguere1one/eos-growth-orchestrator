// Database optimization utilities
import { supabase } from '@/integrations/supabase/client';

// Batch operations to reduce database calls
export const batchUpdateIssues = async (updates: Array<{ id: string; data: any }>) => {
  const promises = updates.map(({ id, data }) =>
    supabase
      .from('eos_issues')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  );
  
  return Promise.all(promises);
};

// Optimized queries with selective fields
export const getIssuesSummary = async () => {
  const { data, error } = await supabase
    .from('eos_issues')
    .select('id, title, status, priority, created_at')
    .is('archived_at', null)
    .order('priority', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  return data;
};

// Bulk insert for better performance
export const bulkCreateIssues = async (issues: any[]) => {
  const { data, error } = await supabase
    .from('eos_issues')
    .insert(issues)
    .select();
  
  if (error) throw error;
  return data;
};

// Pagination helper
export const getPaginatedRocks = async (page: number, pageSize: number = 10) => {
  const start = page * pageSize;
  const end = start + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from('eos_rocks')
    .select('*', { count: 'exact' })
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .range(start, end);
  
  if (error) throw error;
  
  return {
    data,
    hasMore: (count || 0) > end + 1,
    totalCount: count || 0
  };
};

// Real-time subscription setup
export const setupRealTimeSubscription = (table: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe();
};