
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientAdvanced {
  id: string;
  name: string;
  domain?: string;
  monthly_quota: number;
  is_active: boolean;
  status: 'active' | 'paused' | 'at_risk' | 'onboarding' | 'archived';
  segment?: string;
  account_manager_id?: string;
  account_manager?: {
    id: string;
    display_name?: string;
    email: string;
  };
  mrr: number;
  health_score: number;
  flags: string[];
  integrations: Record<string, boolean>;
  last_activity_at?: string;
  next_milestone_at?: string;
  source_acquisition?: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  utilization?: {
    published_count: number;
    utilization_percent: number;
  };
  contacts?: ClientContact[];
  milestones?: ClientMilestone[];
}

export interface ClientContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface ClientMilestone {
  id: string;
  title: string;
  due_date: string;
  type?: string;
  completed: boolean;
}

export interface ClientFilters {
  search?: string;
  status?: string[];
  segment?: string[];
  account_manager_id?: string[];
  health_score_min?: number;
  health_score_max?: number;
  utilization_min?: number;
  utilization_max?: number;
  flags?: string[];
  integrations?: string[];
}

export interface ClientKPIs {
  total_clients: number;
  at_risk_count: number;
  average_roas: number;
  average_quota_usage: number;
  total_mrr: number;
}

export const useClientsAdvanced = (filters: ClientFilters = {}, page = 0, size = 50) => {
  return useQuery({
    queryKey: ['clients-advanced', filters, page, size],
    queryFn: async (): Promise<{ data: ClientAdvanced[]; total: number }> => {
      let query = supabase
        .from('clients')
        .select(`
          *,
          account_manager:profiles!clients_account_manager_id_fkey(
            id,
            display_name,
            email
          )
        `)
        .eq('is_active', true)
        .is('archived_at', null);

      // Filtres
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.segment?.length) {
        query = query.in('segment', filters.segment);
      }
      if (filters.account_manager_id?.length) {
        query = query.in('account_manager_id', filters.account_manager_id);
      }
      if (filters.health_score_min !== undefined) {
        query = query.gte('health_score', filters.health_score_min);
      }
      if (filters.health_score_max !== undefined) {
        query = query.lte('health_score', filters.health_score_max);
      }

      // Pagination
      const from = page * size;
      const to = from + size - 1;
      query = query.range(from, to);

      // Tri par défaut
      query = query.order('health_score', { ascending: false });

      const { data: clients, error, count } = await query;
      if (error) throw error;

      // Récupérer les données d'utilisation
      const clientIds = clients?.map(c => c.id) || [];
      const { data: utilizations } = await supabase
        .from('client_utilization_current_month')
        .select('*')
        .in('client_id', clientIds);

      // Fusionner les données
      const enrichedClients: ClientAdvanced[] = (clients || []).map(client => ({
        ...client,
        utilization: utilizations?.find(u => u.client_id === client.id) || {
          published_count: 0,
          utilization_percent: 0
        }
      }));

      return {
        data: enrichedClients,
        total: count || 0
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useClientKPIs = (period = 'current_month') => {
  return useQuery({
    queryKey: ['client-kpis', period],
    queryFn: async (): Promise<ClientKPIs> => {
      // Récupérer les clients actifs
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, status, health_score, mrr, flags')
        .eq('is_active', true)
        .is('archived_at', null);

      if (error) throw error;

      // Récupérer les utilisations
      const { data: utilizations } = await supabase
        .from('client_utilization_current_month')
        .select('*');

      const totalClients = clients?.length || 0;
      const atRiskCount = clients?.filter(c => 
        c.health_score < 60 || 
        c.flags?.includes('overdue') || 
        c.flags?.includes('no_meeting_14d')
      ).length || 0;

      const averageQuotaUsage = utilizations?.length 
        ? utilizations.reduce((acc, u) => acc + u.utilization_percent, 0) / utilizations.length
        : 0;

      const totalMrr = clients?.reduce((acc, c) => acc + (c.mrr || 0), 0) || 0;

      return {
        total_clients: totalClients,
        at_risk_count: atRiskCount,
        average_roas: 0, // À implémenter avec les données ads
        average_quota_usage: Math.round(averageQuotaUsage),
        total_mrr: totalMrr
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ClientAdvanced> }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-advanced'] });
      queryClient.invalidateQueries({ queryKey: ['client-kpis'] });
      toast({
        title: "Client mis à jour",
        description: "Les modifications ont été sauvegardées."
      });
    },
  });
};

export const useBulkUpdateClients = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<ClientAdvanced> }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .in('id', ids)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients-advanced'] });
      queryClient.invalidateQueries({ queryKey: ['client-kpis'] });
      toast({
        title: "Clients mis à jour",
        description: `${variables.ids.length} client(s) modifié(s) avec succès.`
      });
    },
  });
};

export const useCreateClientAdvanced = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clientData: {
      name: string;
      domain?: string;
      monthly_quota: number;
      status: string;
      segment?: string;
      account_manager_id?: string;
      contacts?: Omit<ClientContact, 'id'>[];
      integrations?: Record<string, boolean>;
    }) => {
      const { contacts, ...client } = clientData;

      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          ...client,
          integrations: client.integrations || {},
          is_active: true
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Ajouter les contacts s'il y en a
      if (contacts?.length) {
        const contactsWithClientId = contacts.map(contact => ({
          ...contact,
          client_id: newClient.id
        }));

        const { error: contactsError } = await supabase
          .from('client_contacts')
          .insert(contactsWithClientId);

        if (contactsError) throw contactsError;
      }

      return newClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-advanced'] });
      queryClient.invalidateQueries({ queryKey: ['client-kpis'] });
      toast({
        title: "Client créé",
        description: "Le nouveau client a été ajouté avec succès."
      });
    },
  });
};
