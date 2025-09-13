
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Campaign {
  id: string;
  name: string;
  objective?: string;
  budget_total: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
  };
}

export interface CampaignMetrics {
  campaign_id: string;
  total_spend: number;
  total_revenue: number;
  total_clicks: number;
  total_leads: number;
  cpc?: number;
  cpl?: number;
  roas?: number;
}

export interface CampaignStats {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  leads: number;
  spend: number;
  revenue: number;
}

export function useAdsCampaigns() {
  return useQuery({
    queryKey: ["ads-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads_campaigns")
        .select(`
          *,
          clients (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
  });
}

export function useCampaignMetrics() {
  return useQuery({
    queryKey: ["ads-campaign-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads_campaign_metrics")
        .select("*");

      if (error) throw error;
      return data as CampaignMetrics[];
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaign: {
      name: string;
      objective?: string;
      budget_total: number;
      client_id?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      const { data, error } = await supabase
        .from("ads_campaigns")
        .insert([campaign])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ads-campaign-metrics"] });
      toast({
        title: "Campagne créée",
        description: "La campagne a été créée avec succès.",
      });
    },
    onError: (error) => {
      console.error("Error creating campaign:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la campagne.",
        variant: "destructive",
      });
    },
  });
}

export function useGlobalAdsMetrics() {
  return useQuery({
    queryKey: ["global-ads-metrics"],
    queryFn: async () => {
      const { data: campaigns } = await supabase
        .from("ads_campaigns")
        .select("budget_total");
      
      const { data: metrics } = await supabase
        .from("ads_campaign_metrics")
        .select("*");

      if (!campaigns || !metrics) return null;

      const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget_total || 0), 0);
      const totalSpend = metrics.reduce((sum, m) => sum + (m.total_spend || 0), 0);
      const totalClicks = metrics.reduce((sum, m) => sum + (m.total_clicks || 0), 0);
      const totalLeads = metrics.reduce((sum, m) => sum + (m.total_leads || 0), 0);
      const totalRevenue = metrics.reduce((sum, m) => sum + (m.total_revenue || 0), 0);

      return {
        totalBudget,
        totalSpend,
        avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
        avgCpl: totalLeads > 0 ? totalSpend / totalLeads : 0,
        avgRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      };
    },
  });
}
