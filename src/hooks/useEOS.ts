
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect, useCallback } from 'react';

// Types based on our Supabase schema
export interface EOSIssue {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: 'open' | 'resolved';
  priority: number;
  resolved_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EOSRock {
  id: string;
  title: string;
  description?: string;
  owner_id?: string;
  start_date?: string;
  due_date?: string;
  progress: number;
  status: 'not_started' | 'on_track' | 'at_risk' | 'completed';
  completed_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EOSKPI {
  id: string;
  name: string;
  unit?: string;
  target?: number;
  direction: string;
  position: number;
  is_active: boolean;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EOSKPIValue {
  id: string;
  kpi_id: string;
  week_start_date: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface EOSTodo {
  id: string;
  description: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EOSMeeting {
  id: string;
  started_at?: string;
  ended_at?: string;
  status: 'planned' | 'in_progress' | 'ended';
  agenda: Array<{
    key: string;
    title: string;
    minutes: number;
  }>;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

// Issues hooks with realtime optimizations
export const useEOSIssues = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['eos-issues'],
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable polling since we have realtime
  });

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('eos-issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eos_issues'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['eos-issues'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useCreateIssue = () => {
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
    onMutate: async (newIssue) => {
      // Optimistic updates
      await queryClient.cancelQueries({ queryKey: ['eos-issues'] });
      const previousIssues = queryClient.getQueryData<EOSIssue[]>(['eos-issues']);
      
      if (previousIssues) {
        const optimisticIssue: EOSIssue = {
          ...newIssue,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        queryClient.setQueryData(['eos-issues'], [...previousIssues, optimisticIssue]);
      }
      
      return { previousIssues };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['eos-issues'] });
      toast({ title: "Issue créée avec succès" });
    },
    onError: (error, newIssue, context) => {
      // Rollback optimistic update
      if (context?.previousIssues) {
        queryClient.setQueryData(['eos-issues'], context.previousIssues);
      }
      console.error('Create issue error:', error);
      toast({ 
        title: "Erreur lors de la création", 
        description: "Impossible de créer l'issue",
        variant: "destructive" 
      });
    }
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EOSIssue> & { id: string }) => {
      const { data, error } = await supabase
        .from('eos_issues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-issues'] });
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

// Rocks hooks with realtime optimizations
export const useEOSRocks = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['eos-rocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_rocks')
        .select('id, title, description, owner_id, start_date, due_date, progress, status, completed_at, archived_at, created_at, updated_at')
        .is('archived_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EOSRock[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes 
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('eos-rocks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eos_rocks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['eos-rocks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useCreateRock = () => {
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
      queryClient.invalidateQueries({ queryKey: ['eos-rocks'] });
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

export const useUpdateRock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EOSRock> & { id: string }) => {
      const { data, error } = await supabase
        .from('eos_rocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-rocks'] });
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

// KPIs hooks with optimizations  
export const useEOSKPIs = () => {
  return useQuery({
    queryKey: ['eos-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_kpis')
        .select('*')
        .is('archived_at', null)
        .eq('is_active', true)
        .order('position');
      
      if (error) throw error;
      return data as EOSKPI[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (KPIs are more stable)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false, // KPIs don't need frequent refetching
  });
};

export const useCreateKPI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (kpi: Omit<EOSKPI, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('eos_kpis')
        .insert(kpi)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-kpis'] });
      toast({ title: "KPI créé avec succès" });
    },
    onError: (error) => {
      console.error('Create KPI error:', error);
      toast({ 
        title: "Erreur lors de la création du KPI", 
        variant: "destructive" 
      });
    }
  });
};

export const useUpdateKPI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EOSKPI> & { id: string }) => {
      const { data, error } = await supabase
        .from('eos_kpis')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['eos-kpi-values'] });
      toast({ title: "KPI mis à jour avec succès" });
    },
    onError: (error) => {
      console.error('Update KPI error:', error);
      toast({ 
        title: "Erreur lors de la mise à jour du KPI", 
        variant: "destructive" 
      });
    }
  });
};

// Hook to get KPI values for a specific week
export const useKPIValuesForWeek = (weekStartDate: string) => {
  return useQuery({
    queryKey: ['eos-kpi-values', weekStartDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_kpi_values')
        .select('id, kpi_id, value, week_start_date')
        .eq('week_start_date', weekStartDate);
      
      if (error) throw error;
      return data as EOSKPIValue[];
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to upsert KPI value (create or update)
export const useUpsertKPIValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (kpiValue: Omit<EOSKPIValue, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('eos_kpi_values')
        .upsert(kpiValue, {
          onConflict: 'kpi_id,week_start_date',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['eos-kpi-values', variables.week_start_date] 
      });
    },
    onError: (error) => {
      console.error('Upsert KPI value error:', error);
      toast({ 
        title: "Erreur lors de la sauvegarde", 
        variant: "destructive" 
      });
    }
  });
};

// Hook to get historical KPI values for trends (last 13 weeks)
export const useKPITrends = (kpiId: string) => {
  return useQuery({
    queryKey: ['eos-kpi-trends', kpiId],
    queryFn: async () => {
      const thirteenWeeksAgo = new Date();
      thirteenWeeksAgo.setDate(thirteenWeeksAgo.getDate() - (13 * 7));
      
      const { data, error } = await supabase
        .from('eos_kpi_values')
        .select('value, week_start_date')
        .eq('kpi_id', kpiId)
        .gte('week_start_date', thirteenWeeksAgo.toISOString().split('T')[0])
        .order('week_start_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!kpiId,
  });
};

// Todos hooks with realtime optimizations
export const useEOSTodos = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['eos-todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_todos')
        .select('id, description, assigned_to, due_date, completed_at, archived_at, created_at, updated_at')
        .is('archived_at', null)
        .is('completed_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EOSTodo[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    refetchOnWindowFocus: false,
  });

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('eos-todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eos_todos'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['eos-todos'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useCreateTodo = () => {
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
      queryClient.invalidateQueries({ queryKey: ['eos-todos'] });
      toast({ title: "Todo créé avec succès" });
    },
    onError: (error) => {
      console.error('Create todo error:', error);
      toast({ 
        title: "Erreur lors de la création", 
        variant: "destructive" 
      });
    }
  });
};

// Meetings hooks with optimizations
export const useEOSMeetings = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['eos-meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_meetings')
        .select(`
          id,
          status,
          started_at,
          ended_at,
          agenda,
          created_at,
          updated_at,
          created_by
        `)
        .is('archived_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(meeting => ({
        ...meeting,
        agenda: meeting.agenda as Array<{
          key: string;
          title: string;
          minutes: number;
        }>
      })) as EOSMeeting[];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (meeting: Omit<EOSMeeting, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('eos_meetings')
        .insert(meeting)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-meetings'] });
      toast({ title: "Réunion créée avec succès" });
    },
    onError: (error) => {
      console.error('Create meeting error:', error);
      toast({ 
        title: "Erreur lors de la création", 
        variant: "destructive" 
      });
    }
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EOSMeeting> }) => {
      const { data, error } = await supabase
        .from('eos_meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-meetings'] });
      toast({ title: "Réunion mise à jour avec succès" });
    },
    onError: (error) => {
      console.error('Update meeting error:', error);
      toast({ 
        title: "Erreur lors de la mise à jour", 
        variant: "destructive" 
      });
    }
  });
};
