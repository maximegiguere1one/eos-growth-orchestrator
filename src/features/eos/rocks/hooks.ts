import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { EOSRock, EOSRockInsert, EOSRockUpdate } from './types';
import { rocksQueryKeys } from './queryKeys';

export function useEOSRocks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: rocksQueryKeys.lists(),
    queryFn: async (): Promise<EOSRock[]> => {
      const { data, error } = await supabase
        .from('eos_rocks')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('eos_rocks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eos_rocks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: rocksQueryKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useCreateRock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rock: EOSRockInsert): Promise<EOSRock> => {
      const { data, error } = await supabase
        .from('eos_rocks')
        .insert(rock)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rocksQueryKeys.all });
      toast({
        title: "Rock created",
        description: "The rock has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating rock",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateRock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EOSRockUpdate }): Promise<EOSRock> => {
      const updateData = {
        ...updates,
        ...(updates.status === 'completed' && !updates.completed_at && { completed_at: new Date().toISOString() }),
      };

      const { data, error } = await supabase
        .from('eos_rocks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rocksQueryKeys.all });
      toast({
        title: "Rock updated",
        description: "The rock has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating rock",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}