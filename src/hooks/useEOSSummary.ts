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
      // Execute optimized count and aggregate queries in parallel
      const [issuesCountResult, activeIssuesResult, rocksAggResult, todosCountResult, kpisCountResult] = await Promise.all([
        // Total issues count - head request only
        supabase
          .from('eos_issues')
          .select('*', { count: 'exact', head: true })
          .is('archived_at', null),
        
        // Active issues count - head request only
        supabase
          .from('eos_issues')
          .select('*', { count: 'exact', head: true })
          .is('archived_at', null)
          .eq('status', 'open'),
        
        // Rocks aggregations - use minimal data for calculations
        supabase
          .from('eos_rocks')
          .select('status, progress', { count: 'exact' })
          .is('archived_at', null),
        
        // Active todos count - head request only
        supabase
          .from('eos_todos')
          .select('*', { count: 'exact', head: true })
          .is('archived_at', null)
          .is('completed_at', null),
        
        // Active KPIs count - head request only
        supabase
          .from('eos_kpis')
          .select('*', { count: 'exact', head: true })
          .is('archived_at', null)
          .eq('is_active', true)
      ]);

      if (issuesCountResult.error) throw issuesCountResult.error;
      if (activeIssuesResult.error) throw activeIssuesResult.error;
      if (rocksAggResult.error) throw rocksAggResult.error;
      if (todosCountResult.error) throw todosCountResult.error;
      if (kpisCountResult.error) throw kpisCountResult.error;

      // Calculate aggregations from minimal rocks data
      const completedRocksCount = rocksAggResult.data?.filter(r => r.status === 'completed').length || 0;
      const averageRocksProgress = rocksAggResult.data?.length 
        ? Math.round(rocksAggResult.data.reduce((sum, rock) => sum + rock.progress, 0) / rocksAggResult.data.length)
        : 0;

      return {
        issuesCount: issuesCountResult.count || 0,
        activeIssuesCount: activeIssuesResult.count || 0,
        rocksCount: rocksAggResult.count || 0,
        completedRocksCount,
        averageRocksProgress,
        todosCount: todosCountResult.count || 0,
        kpisCount: kpisCountResult.count || 0,
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