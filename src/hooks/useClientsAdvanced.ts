
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

// Helper function to generate mock client data
const enrichClientData = (client: any): ClientAdvanced => {
  const healthScore = Math.floor(Math.random() * 40 + 60); // 60-100
  const utilizationPercent = Math.floor(Math.random() * 100);
  const publishedCount = Math.floor((utilizationPercent / 100) * client.monthly_quota);
  
  return {
    ...client,
    status: client.is_active ? 'active' : 'paused',
    segment: ['ecom', 'local', 'b2b', 'saas'][Math.floor(Math.random() * 4)],
    mrr: Math.floor(Math.random() * 5000 + 1000),
    health_score: healthScore,
    flags: healthScore < 70 ? ['low_engagement'] : [],
    integrations: {
      stripe: Math.random() > 0.5,
      ghl: Math.random() > 0.3,
      ads: Math.random() > 0.4,
      ga4: Math.random() > 0.6
    },
    last_activity_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    utilization: {
      published_count: publishedCount,
      utilization_percent: utilizationPercent
    },
    contacts: [],
    milestones: []
  };
};

export const useClientsAdvanced = (filters: ClientFilters = {}, page = 0, size = 50) => {
  return useQuery({
    queryKey: ['clients-advanced', filters, page, size],
    queryFn: async (): Promise<{ data: ClientAdvanced[]; total: number }> => {
      let query = supabase
        .from('clients')
        .select(`
          *
        `)
        .eq('is_active', true)
        .is('archived_at', null);

      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Pagination
      const from = page * size;
      const to = from + size - 1;
      query = query.range(from, to);

      // Default sorting
      query = query.order('created_at', { ascending: false });

      const { data: clients, error, count } = await query;
      if (error) throw error;

      // Enrich with mock data for new fields
      const enrichedClients: ClientAdvanced[] = (clients || []).map(enrichClientData);

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
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, monthly_quota')
        .eq('is_active', true)
        .is('archived_at', null);

      if (error) throw error;

      const totalClients = clients?.length || 0;
      const atRiskCount = Math.floor(totalClients * 0.15); // Mock 15% at risk
      const averageQuotaUsage = 73; // Mock average
      const totalMrr = totalClients * 2500; // Mock MRR

      return {
        total_clients: totalClients,
        at_risk_count: atRiskCount,
        average_roas: 2.4, // Mock ROAS
        average_quota_usage: averageQuotaUsage,
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
      // Only update fields that exist in the current table
      const allowedUpdates = {
        name: updates.name,
        monthly_quota: updates.monthly_quota,
        is_active: updates.is_active
      };

      const { data, error } = await supabase
        .from('clients')
        .update(allowedUpdates)
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
      // Only update fields that exist in the current table
      const allowedUpdates = {
        monthly_quota: updates.monthly_quota,
        is_active: updates.is_active
      };

      const { data, error } = await supabase
        .from('clients')
        .update(allowedUpdates)
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
      monthly_quota: number;
      contacts?: Omit<ClientContact, 'id'>[];
    }) => {
      const { contacts, ...client } = clientData;

      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          ...client,
          is_active: true
        })
        .select()
        .single();

      if (clientError) throw clientError;
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
