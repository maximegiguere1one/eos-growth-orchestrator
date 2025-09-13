import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

// Types pour le suivi de croissance
export interface ClientGrowthMetrics {
  id: string;
  client_id: string;
  week_start_date: string;
  revenue: number;
  active_users: number;
  conversion_rate: number;
  churn_rate: number;
  customer_satisfaction: number;
  growth_score: number;
  health_status: 'excellent' | 'good' | 'warning' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface GrowthAlert {
  id: string;
  client_id: string;
  alert_type: 'revenue_decline' | 'churn_spike' | 'satisfaction_drop' | 'growth_stagnation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommended_actions: string[];
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface GrowthRecommendation {
  id: string;
  client_id: string;
  recommendation_type: 'eos_issue' | 'eos_rock' | 'kpi_focus' | 'meeting_action';
  title: string;
  description: string;
  priority: number;
  estimated_impact: 'low' | 'medium' | 'high';
  implementation_effort: 'easy' | 'moderate' | 'complex';
  is_implemented: boolean;
  created_at: string;
  implemented_at?: string;
}

// Hook pour récupérer les métriques de croissance d'un client (mockées pour l'instant)
export const useClientGrowthMetrics = (clientId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['client-growth-metrics', clientId],
    queryFn: async () => {
      // Mock data en attendant la migration de la base de données
      const mockMetrics: ClientGrowthMetrics[] = [
        {
          id: '1',
          client_id: clientId,
          week_start_date: '2025-08-26',
          revenue: 15000,
          active_users: 1250,
          conversion_rate: 3.5,
          churn_rate: 2.1,
          customer_satisfaction: 85,
          growth_score: 78,
          health_status: 'good',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          client_id: clientId,
          week_start_date: '2025-09-02',
          revenue: 16200,
          active_users: 1320,
          conversion_rate: 3.8,
          churn_rate: 1.9,
          customer_satisfaction: 87,
          growth_score: 82,
          health_status: 'good',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return mockMetrics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientId,
  });

  return query;
};

// Hook pour récupérer les alertes de croissance (mockées pour l'instant)
export const useGrowthAlerts = (clientId?: string) => {
  return useQuery({
    queryKey: ['growth-alerts', clientId],
    queryFn: async () => {
      // Mock data en attendant la migration de la base de données
      const mockAlerts: GrowthAlert[] = [
        {
          id: '1',
          client_id: clientId || 'demo-client',
          alert_type: 'revenue_decline',
          severity: 'high',
          message: 'Baisse des revenus de 15% détectée cette semaine',
          recommended_actions: [
            'Analyser les causes de la baisse',
            'Créer un issue EOS prioritaire',
            'Planifier une réunion d\'urgence'
          ],
          is_resolved: false,
          created_at: new Date().toISOString()
        }
      ];
      
      return clientId ? mockAlerts.filter(a => a.client_id === clientId) : mockAlerts;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour les recommandations de croissance
export const useGrowthRecommendations = (clientId: string) => {
  return useQuery({
    queryKey: ['growth-recommendations', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('growth_recommendations')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_implemented', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GrowthRecommendation[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!clientId,
  });
};

// Mutation pour créer des métriques de croissance
export const useCreateGrowthMetrics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metrics: Omit<ClientGrowthMetrics, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('client_growth_metrics')
        .insert(metrics)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-growth-metrics'] });
      toast({
        title: "Métriques enregistrées",
        description: "Les métriques de croissance ont été mises à jour avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les métriques de croissance.",
        variant: "destructive",
      });
    },
  });
};

// Mutation pour résoudre une alerte
export const useResolveGrowthAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('growth_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growth-alerts'] });
      toast({
        title: "Alerte résolue",
        description: "L'alerte a été marquée comme résolue.",
      });
    },
  });
};

// Mutation pour implémenter une recommandation
export const useImplementRecommendation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recommendationId: string) => {
      const { data, error } = await supabase
        .from('growth_recommendations')
        .update({ 
          is_implemented: true, 
          implemented_at: new Date().toISOString() 
        })
        .eq('id', recommendationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growth-recommendations'] });
      toast({
        title: "Recommandation implémentée",
        description: "La recommandation a été marquée comme implémentée.",
      });
    },
  });
};

// Fonction utilitaire pour calculer le score de santé
export const calculateHealthScore = (metrics: ClientGrowthMetrics): number => {
  const weights = {
    revenue: 0.3,
    active_users: 0.2,
    conversion_rate: 0.2,
    churn_rate: 0.15, // Inversé car plus bas = mieux
    customer_satisfaction: 0.15,
  };
  
  // Normalisation des métriques (0-100)
  const normalizedRevenue = Math.min(100, (metrics.revenue / 10000) * 100);
  const normalizedUsers = Math.min(100, (metrics.active_users / 1000) * 100);
  const normalizedConversion = metrics.conversion_rate;
  const normalizedChurn = Math.max(0, 100 - (metrics.churn_rate * 10)); // Inversé
  const normalizedSatisfaction = metrics.customer_satisfaction;
  
  const score = 
    normalizedRevenue * weights.revenue +
    normalizedUsers * weights.active_users +
    normalizedConversion * weights.conversion_rate +
    normalizedChurn * weights.churn_rate +
    normalizedSatisfaction * weights.customer_satisfaction;
  
  return Math.round(score);
};

// Fonction pour déterminer le statut de santé
export const getHealthStatus = (score: number): ClientGrowthMetrics['health_status'] => {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'warning';
  return 'critical';
};

// Hook pour générer automatiquement des recommandations EOS
export const useGenerateEOSRecommendations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId: string) => {
      // Récupérer les métriques actuelles
      const { data: metrics } = await supabase
        .from('client_growth_metrics')
        .select('*')
        .eq('client_id', clientId)
        .order('week_start_date', { ascending: false })
        .limit(4); // 4 dernières semaines
      
      if (!metrics || metrics.length === 0) {
        throw new Error('Aucune métrique disponible pour générer des recommandations');
      }
      
      const recommendations: Omit<GrowthRecommendation, 'id' | 'created_at'>[] = [];
      const latestMetrics = metrics[0];
      
      // Analyser les tendances et générer des recommandations
      if (latestMetrics.revenue < (metrics[1]?.revenue || 0)) {
        recommendations.push({
          client_id: clientId,
          recommendation_type: 'eos_issue',
          title: 'Baisse de revenus détectée',
          description: 'Créer un issue EOS pour analyser la baisse de revenus et identifier les causes racines.',
          priority: 9,
          estimated_impact: 'high',
          implementation_effort: 'moderate',
          is_implemented: false,
        });
      }
      
      if (latestMetrics.churn_rate > 0.05) { // Plus de 5% de churn
        recommendations.push({
          client_id: clientId,
          recommendation_type: 'eos_rock',
          title: 'Rock: Réduire le taux de churn',
          description: 'Créer un Rock trimestriel pour réduire le taux de churn de 50% d\'ici la fin du trimestre.',
          priority: 8,
          estimated_impact: 'high',
          implementation_effort: 'complex',
          is_implemented: false,
        });
      }
      
      if (latestMetrics.customer_satisfaction < 70) {
        recommendations.push({
          client_id: clientId,
          recommendation_type: 'kpi_focus',
          title: 'KPI Focus: Satisfaction client',
          description: 'Ajouter la satisfaction client comme KPI prioritaire dans le scorecard hebdomadaire.',
          priority: 7,
          estimated_impact: 'medium',
          implementation_effort: 'easy',
          is_implemented: false,
        });
      }
      
      // Insérer les recommandations
      if (recommendations.length > 0) {
        const { data, error } = await supabase
          .from('growth_recommendations')
          .insert(recommendations)
          .select();
        
        if (error) throw error;
        return data;
      }
      
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growth-recommendations'] });
      toast({
        title: "Recommandations générées",
        description: "De nouvelles recommandations EOS ont été créées pour améliorer la croissance.",
      });
    },
  });
};
