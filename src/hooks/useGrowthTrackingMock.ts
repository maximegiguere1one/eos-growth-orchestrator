import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

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

// Fonctions utilitaires
export const calculateHealthScore = (metrics: ClientGrowthMetrics): number => {
  const normalizedRevenue = Math.min(100, (metrics.revenue / 10000) * 100);
  const normalizedUsers = Math.min(100, (metrics.active_users / 1000) * 100);
  const normalizedConversion = metrics.conversion_rate;
  const normalizedChurn = Math.max(0, 100 - (metrics.churn_rate * 10));
  const normalizedSatisfaction = metrics.customer_satisfaction;
  
  return Math.round(
    normalizedRevenue * 0.3 +
    normalizedUsers * 0.2 +
    normalizedConversion * 0.2 +
    normalizedChurn * 0.15 +
    normalizedSatisfaction * 0.15
  );
};

export const getHealthStatus = (score: number): 'excellent' | 'good' | 'warning' | 'critical' => {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'warning';
  return 'critical';
};

// Hook pour récupérer les métriques de croissance d'un client
export const useClientGrowthMetrics = (clientId: string) => {
  return useQuery({
    queryKey: ['client-growth-metrics', clientId],
    queryFn: async () => {
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
    staleTime: 5 * 60 * 1000,
    enabled: !!clientId,
  });
};

// Hook pour récupérer les alertes de croissance
export const useGrowthAlerts = (clientId?: string) => {
  return useQuery({
    queryKey: ['growth-alerts', clientId],
    queryFn: async () => {
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
    staleTime: 2 * 60 * 1000,
  });
};

// Hook pour les recommandations de croissance
export const useGrowthRecommendations = (clientId: string) => {
  return useQuery({
    queryKey: ['growth-recommendations', clientId],
    queryFn: async () => {
      const mockRecommendations: GrowthRecommendation[] = [
        {
          id: '1',
          client_id: clientId,
          recommendation_type: 'eos_issue',
          title: 'Améliorer le processus de conversion',
          description: 'Le taux de conversion est en baisse, il faut identifier les points de friction.',
          priority: 8,
          estimated_impact: 'high',
          implementation_effort: 'moderate',
          is_implemented: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          client_id: clientId,
          recommendation_type: 'eos_rock',
          title: 'Réduire le churn à moins de 2%',
          description: 'Objectif trimestriel pour améliorer la rétention client.',
          priority: 9,
          estimated_impact: 'high',
          implementation_effort: 'complex',
          is_implemented: false,
          created_at: new Date().toISOString()
        }
      ];
      
      return mockRecommendations;
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
      // Simulation d'une création
      const newMetrics: ClientGrowthMetrics = {
        ...metrics,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return newMetrics;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-growth-metrics'] });
      toast({
        title: "Métriques enregistrées",
        description: `Score de santé: ${data.growth_score}/100 (${data.health_status})`,
      });
    },
  });
};

// Mutation pour résoudre une alerte
export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      // Simulation de résolution
      return { id: alertId, is_resolved: true };
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
      // Simulation d'implémentation
      return { id: recommendationId, is_implemented: true };
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
