
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';

export interface SavedView {
  id: string;
  name: string;
  params: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useClientSavedViews = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['client-saved-views', user?.id],
    queryFn: async (): Promise<SavedView[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('client_saved_views' as any)
        .select('id, name, params, is_default, created_at, updated_at')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as SavedView[];
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!user?.id,
  });
};

export const useSaveView = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (viewData: {
      name: string;
      params: any;
      is_default?: boolean;
    }) => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');

      if (viewData.is_default) {
        await supabase
          .from('client_saved_views' as any)
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('client_saved_views' as any)
        .insert({
          user_id: user.id,
          name: viewData.name,
          params: viewData.params,
          is_default: viewData.is_default || false,
        })
        .select('id, name, params, is_default, created_at, updated_at')
        .single();

      if (error) throw error;
      return data as unknown as SavedView;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-saved-views'] });
      toast({
        title: "Vue sauvegardée",
        description: "Votre vue personnalisée a été enregistrée."
      });
    },
  });
};

export const useDeleteSavedView = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (viewId: string) => {
      const { error } = await supabase
        .from('client_saved_views' as any)
        .delete()
        .eq('id', viewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-saved-views'] });
      toast({
        title: "Vue supprimée",
        description: "La vue personnalisée a été supprimée."
      });
    },
  });
};
