import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EOSIssue, EOSRock, EOSTodo, EOSKPI } from './useEOS';

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