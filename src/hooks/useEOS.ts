
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

// Issues hooks
export const useEOSIssues = () => {
  return useQuery({
    queryKey: ['eos-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_issues')
        .select('*')
        .is('archived_at', null)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EOSIssue[];
    }
  });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-issues'] });
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

// Rocks hooks
export const useEOSRocks = () => {
  return useQuery({
    queryKey: ['eos-rocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_rocks')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EOSRock[];
    }
  });
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

// KPIs hooks
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
    }
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

// Todos hooks
export const useEOSTodos = () => {
  return useQuery({
    queryKey: ['eos-todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_todos')
        .select('*')
        .is('archived_at', null)
        .is('completed_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EOSTodo[];
    }
  });
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

// Meetings hooks
export const useEOSMeetings = () => {
  return useQuery({
    queryKey: ['eos-meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eos_meetings')
        .select('*')
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
    }
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
      toast({ title: "Meeting créé avec succès" });
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
