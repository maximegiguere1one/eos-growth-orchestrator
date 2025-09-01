
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedView {
  id: string;
  name: string;
  params: {
    filters?: any;
    sort?: any;
    columns?: string[];
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useClientSavedViews = () => {
  return useQuery({
    queryKey: ['client-saved-views'],
    queryFn: async (): Promise<SavedView[]> => {
      const { data, error } = await supabase
        .from('client_saved_views')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as SavedView[];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useSaveView = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (viewData: {
      name: string;
      params: any;
      is_default?: boolean;
    }) => {
      // Si c'est une vue par défaut, désactiver les autres
      if (viewData.is_default) {
        await supabase
          .from('client_saved_views')
          .update({ is_default: false })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Éviter les conflits
      }

      const { data, error } = await supabase
        .from('client_saved_views')
        .insert({
          name: viewData.name,
          params: viewData.params,
          is_default: viewData.is_default || false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
        .from('client_saved_views')
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
