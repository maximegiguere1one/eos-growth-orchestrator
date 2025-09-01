import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface EOSSummary {
  issuesCount: number;
  activeIssuesCount: number;
  rocksCount: number;
  completedRocksCount: number;
  averageRocksProgress: number;
  todosCount: number;
  kpisCount: number;
}

// Optimized summary hook - fetches only counts/aggregates
export const useEOSSummary = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['eos-summary'],
    queryFn: async (): Promise<EOSSummary> => {
      // Execute all count queries in parallel for better performance
      const [issuesResult, rocksResult, todosResult, kpisResult] = await Promise.all([
        // Issues count query - only count, not full data
        supabase
          .from('eos_issues')
          .select('id, status', { count: 'exact' })
          .is('archived_at', null),
        
        // Rocks count and progress aggregation
        supabase
          .from('eos_rocks')
          .select('id, status, progress', { count: 'exact' })
          .is('archived_at', null),
        
        // Active todos count
        supabase
          .from('eos_todos')
          .select('id', { count: 'exact' })
          .is('archived_at', null)
          .is('completed_at', null),
        
        // Active KPIs count
        supabase
          .from('eos_kpis')
          .select('id', { count: 'exact' })
          .is('archived_at', null)
          .eq('is_active', true)
      ]);

      if (issuesResult.error) throw issuesResult.error;
      if (rocksResult.error) throw rocksResult.error;
      if (todosResult.error) throw todosResult.error;
      if (kpisResult.error) throw kpisResult.error;

      // Calculate aggregations from minimal data
      const activeIssuesCount = issuesResult.data?.filter(i => i.status === 'open').length || 0;
      const completedRocksCount = rocksResult.data?.filter(r => r.status === 'completed').length || 0;
      const averageRocksProgress = rocksResult.data?.length 
        ? Math.round(rocksResult.data.reduce((sum, rock) => sum + rock.progress, 0) / rocksResult.data.length)
        : 0;

      return {
        issuesCount: issuesResult.count || 0,
        activeIssuesCount,
        rocksCount: rocksResult.count || 0,
        completedRocksCount,
        averageRocksProgress,
        todosCount: todosResult.count || 0,
        kpisCount: kpisResult.count || 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - summary data can be slightly stale
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Consolidated realtime subscription for all EOS tables
  useEffect(() => {
    const channel = supabase
      .channel('eos-summary-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eos_issues' }, () => {
        queryClient.invalidateQueries({ queryKey: ['eos-summary'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eos_rocks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['eos-summary'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eos_todos' }, () => {
        queryClient.invalidateQueries({ queryKey: ['eos-summary'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eos_kpis' }, () => {
        queryClient.invalidateQueries({ queryKey: ['eos-summary'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};