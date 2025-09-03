
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

// For now, we'll use localStorage until the database types are updated
export const useClientSavedViews = () => {
  return useQuery({
    queryKey: ['client-saved-views'],
    queryFn: async (): Promise<SavedView[]> => {
      // Temporary implementation using localStorage
      const saved = localStorage.getItem('client-saved-views');
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
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
      // Temporary implementation using localStorage
      const saved = localStorage.getItem('client-saved-views');
      const views: SavedView[] = saved ? JSON.parse(saved) : [];
      
      if (viewData.is_default) {
        views.forEach(view => view.is_default = false);
      }

      const newView: SavedView = {
        id: crypto.randomUUID(),
        name: viewData.name,
        params: viewData.params,
        is_default: viewData.is_default || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      views.push(newView);
      localStorage.setItem('client-saved-views', JSON.stringify(views));
      return newView;
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
      // Temporary implementation using localStorage
      const saved = localStorage.getItem('client-saved-views');
      const views: SavedView[] = saved ? JSON.parse(saved) : [];
      const filtered = views.filter(view => view.id !== viewId);
      localStorage.setItem('client-saved-views', JSON.stringify(filtered));
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
