import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect, useCallback, useMemo } from 'react';
import { EOSIssue, EOSRock, EOSTodo, EOSKPI, EOSMeeting } from './useEOS';

// Optimized query options to prevent recreating objects
const createQueryOptions = (staleTime: number = 5 * 60 * 1000) => ({
  staleTime,
  gcTime: staleTime * 2,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
});

// Optimized Issues Hook with extended caching and debounced subscriptions
export const useEOSIssuesOptimized = () => {
  const queryClient = useQueryClient();
  
  const queryOptions = useMemo(
    () => createQueryOptions(10 * 60 * 1000), // 10 minutes cache
    []
  );
  
  const query = useQuery({
    queryKey: ['eos-issues-optimized'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_issues')
        .select('id, title, description, assigned_to, status, priority, resolved_at, archived_at, created_at, updated_at')
        .is('archived_at', null)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EOSIssue[];
    },
    ...queryOptions,
  });

  // Debounced subscription to prevent excessive updates
  const setupSubscription = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    
    const channel = supabase
      .channel('eos-issues-optimized')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eos_issues'
        },
        () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['eos-issues-optimized'] });
          }, 500); // 500ms debounce
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(setupSubscription, [setupSubscription]);

  return query;
};

// Optimized Rocks Hook with better caching
export const useEOSRocksOptimized = () => {
  const queryClient = useQueryClient();
  
  const queryOptions = useMemo(
    () => createQueryOptions(15 * 60 * 1000), // 15 minutes cache
    []
  );
  
  const query = useQuery({
    queryKey: ['eos-rocks-optimized'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_rocks')
        .select('id, title, description, owner_id, start_date, due_date, progress, status, completed_at, archived_at, created_at, updated_at')
        .is('archived_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EOSRock[];
    },
    ...queryOptions,
  });

  const setupSubscription = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    
    const channel = supabase
      .channel('eos-rocks-optimized')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eos_rocks'
        },
        () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['eos-rocks-optimized'] });
          }, 500);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(setupSubscription, [setupSubscription]);

  return query;
};

// Optimized Summary Hook with memoized calculations
export const useEOSSummaryOptimized = () => {
  const issuesQuery = useEOSIssuesOptimized();
  const rocksQuery = useEOSRocksOptimized();

  return useMemo(() => {
    const isLoading = issuesQuery.isLoading || rocksQuery.isLoading;
    const error = issuesQuery.error || rocksQuery.error;

    if (isLoading || error) {
      return { isLoading, error, data: null };
    }

    const issues = issuesQuery.data || [];
    const rocks = rocksQuery.data || [];

    return {
      isLoading: false,
      error: null,
      data: {
        activeIssuesCount: issues.filter(i => i.status === 'open').length,
        rocksCount: rocks.length,
        completedRocksCount: rocks.filter(r => r.status === 'completed').length,
        atRiskRocksCount: rocks.filter(r => r.status === 'at_risk').length,
        onTrackRocksCount: rocks.filter(r => r.status === 'on_track').length,
        highPriorityIssuesCount: issues.filter(i => i.priority >= 8).length,
      }
    };
  }, [issuesQuery.data, rocksQuery.data, issuesQuery.isLoading, rocksQuery.isLoading, issuesQuery.error, rocksQuery.error]);
};

// Optimized mutations that update only relevant queries
export const useOptimizedCreateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (issue: Omit<EOSIssue, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('eos_issues')
        .insert(issue)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Only invalidate specific queries instead of all queries
      queryClient.invalidateQueries({ queryKey: ['eos-summary'] });
      queryClient.invalidateQueries({ queryKey: ['eos-issues-paginated'] });
      // Don't invalidate full list unless we know it's being used
      toast({ title: "Issue créée avec succès" });
    },
    onError: (error) => {
      console.error('Create issue error:', error);
      toast({ 
        title: "Erreur lors de la création", 
        description: "Impossible de créer l'issue",
        variant: "destructive" 
      });
    }
  });
};

export const useOptimizedUpdateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EOSIssue> & { id: string }) => {
      // Handle status changes with proper timestamps
      const finalUpdates = { ...updates };
      if (updates.status === 'resolved' && !updates.resolved_at) {
        finalUpdates.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('eos_issues')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-summary'] });
      queryClient.invalidateQueries({ queryKey: ['eos-issues-paginated'] });
      toast({ title: "Issue mise à jour" });
    },
    onError: (error) => {
      console.error('Update issue error:', error);
      toast({ 
        title: "Erreur lors de la mise à jour", 
        variant: "destructive" 
      });
    }
  });
};

export const useOptimizedCreateRock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rock: Omit<EOSRock, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('eos_rocks')
        .insert(rock)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-summary'] });
      queryClient.invalidateQueries({ queryKey: ['eos-rocks-paginated'] });
      toast({ title: "Rock créé avec succès" });
    },
    onError: (error) => {
      console.error('Create rock error:', error);
      toast({ 
        title: "Erreur lors de la création", 
        description: "Impossible de créer le rock",
        variant: "destructive" 
      });
    }
  });
};

export const useOptimizedUpdateRock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EOSRock> & { id: string }) => {
      // Handle status changes with proper timestamps
      const finalUpdates = { ...updates };
      if (updates.status === 'completed' && !updates.completed_at) {
        finalUpdates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('eos_rocks')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-summary'] });
      queryClient.invalidateQueries({ queryKey: ['eos-rocks-paginated'] });
      toast({ title: "Rock mis à jour" });
    },
    onError: (error) => {
      console.error('Update rock error:', error);
      toast({ 
        title: "Erreur lors de la mise à jour", 
        variant: "destructive" 
      });
    }
  });
};

export const useOptimizedCreateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (todo: Omit<EOSTodo, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('eos_todos')
        .insert(todo)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-summary'] });
      queryClient.invalidateQueries({ queryKey: ['eos-todos-paginated'] });
      toast({ title: "Todo créé avec succès" });
    },
    onError: (error) => {
      console.error('Create todo error:', error);
      toast({ 
        title: "Erreur lors de la création", 
        description: "Impossible de créer le todo",
        variant: "destructive" 
      });
    }
  });
};