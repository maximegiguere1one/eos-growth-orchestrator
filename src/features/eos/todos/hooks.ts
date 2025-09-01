import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { EOSTodo, EOSTodoInsert, EOSTodoUpdate } from './types';
import { todosQueryKeys } from './queryKeys';

export function useEOSTodos() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: todosQueryKeys.lists(),
    queryFn: async (): Promise<EOSTodo[]> => {
      const { data, error } = await supabase
        .from('eos_todos')
        .select('id, description, assigned_to, due_date, completed_at, archived_at, created_by, created_at, updated_at')
        .is('archived_at', null)
        .is('completed_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('eos_todos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eos_todos'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todo: EOSTodoInsert): Promise<EOSTodo> => {
      const { data, error } = await supabase
        .from('eos_todos')
        .insert(todo)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      toast({
        title: "Todo created",
        description: "The todo has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating todo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EOSTodoUpdate }): Promise<EOSTodo> => {
      const updateData = {
        ...updates,
        ...(updates.completed_at !== undefined && { completed_at: updates.completed_at || new Date().toISOString() }),
      };

      const { data, error } = await supabase
        .from('eos_todos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      toast({
        title: "Todo updated",
        description: "The todo has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating todo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}