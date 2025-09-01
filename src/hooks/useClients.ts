
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
  monthly_quota: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true)
        .is('archived_at', null)
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientQuotas = () => {
  return useQuery({
    queryKey: ['client-quotas'],
    queryFn: async () => {
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, name, monthly_quota')
        .eq('is_active', true)
        .is('archived_at', null);
      
      if (clientError) throw clientError;
      
      const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('client_id, status')
        .is('archived_at', null);
      
      if (videoError) throw videoError;
      
      return clients.map(client => {
        const clientVideos = videos.filter(v => v.client_id === client.id);
        const publishedCount = clientVideos.filter(v => v.status === 'published').length;
        
        return {
          name: client.name,
          published: publishedCount,
          quota: client.monthly_quota,
          progress: Math.round((publishedCount / client.monthly_quota) * 100)
        };
      });
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: { name: string; monthly_quota: number; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-quotas'] });
    },
  });
};
