import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { EOSIssue, EOSIssueInsert, EOSIssueUpdate } from './types';
import { issuesQueryKeys } from './queryKeys';

export function useEOSIssues() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: issuesQueryKeys.lists(),
    queryFn: async (): Promise<EOSIssue[]> => {
      const { data, error } = await supabase
        .from('eos_issues')
        .select('id, title, description, priority, status, created_by, assigned_to, resolved_at, archived_at, created_at, updated_at')
        .is('archived_at', null)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Real-time subscription
  useEffect(() => {
      const channel = supabase
        .channel('eos_issues_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'eos_issues'
          },
          (payload) => {
            // Optimistic cache updates instead of full invalidation
            if (payload.eventType === 'INSERT') {
              queryClient.setQueryData<EOSIssue[]>(issuesQueryKeys.lists(), (old) => 
                old ? [payload.new as EOSIssue, ...old] : [payload.new as EOSIssue]
              );
            } else if (payload.eventType === 'UPDATE') {
              queryClient.setQueryData<EOSIssue[]>(issuesQueryKeys.lists(), (old) => 
                old ? old.map(item => item.id === payload.new.id ? payload.new as EOSIssue : item) : []
              );
            } else if (payload.eventType === 'DELETE') {
              queryClient.setQueryData<EOSIssue[]>(issuesQueryKeys.lists(), (old) => 
                old ? old.filter(item => item.id !== payload.old.id) : []
              );
            }
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: EOSIssueInsert): Promise<EOSIssue> => {
      const { data, error } = await supabase
        .from('eos_issues')
        .insert(issue)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issuesQueryKeys.all });
      toast({
        title: "Issue created",
        description: "The issue has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating issue",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EOSIssueUpdate }): Promise<EOSIssue> => {
      const updateData = {
        ...updates,
        ...(updates.status === 'resolved' && !updates.resolved_at && { resolved_at: new Date().toISOString() }),
      };

      const { data, error } = await supabase
        .from('eos_issues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issuesQueryKeys.all });
      toast({
        title: "Issue updated",
        description: "The issue has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating issue",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}