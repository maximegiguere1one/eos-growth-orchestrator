import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, 
  AlertTriangle, 
  Target, 
  Users, 
  TrendingDown, 
  Settings,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger_type: 'metric_threshold' | 'trend_analysis' | 'time_based' | 'manual';
  trigger_conditions: {
    metric?: string;
    operator?: 'greater_than' | 'less_than' | 'equals' | 'percentage_change';
    value?: number;
    timeframe?: string;
  };
  actions: {
    type: 'create_issue' | 'create_rock' | 'send_alert' | 'schedule_meeting' | 'update_kpi';
    parameters: Record<string, any>;
  }[];
  is_active: boolean;
  client_id?: string;
  created_at: string;
  updated_at: string;
}

interface AutomatedWorkflowsProps {
  clientId?: string;
}

export const AutomatedWorkflows: React.FC<AutomatedWorkflowsProps> = ({ clientId }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const queryClient = useQueryClient();

  // Récupérer les règles de workflow (mockées pour l'instant)
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflow-rules', clientId],
    queryFn: async () => {
      // Mock data en attendant la migration de la base de données
      const mockWorkflows: WorkflowRule[] = [
        {
          id: '1',
          name: 'Alerte baisse revenus',
          description: 'Crée automatiquement un issue EOS quand les revenus baissent de plus de 10%',
          trigger_type: 'metric_threshold',
          trigger_conditions: {
            metric: 'revenue',
            operator: 'percentage_change',
            value: -10,
            timeframe: 'week'
          },
          actions: [{
            type: 'create_issue',
            parameters: {
              title: 'Baisse significative des revenus détectée',
              description: 'Les revenus ont chuté de plus de 10% cette semaine.',
              priority: 9
            }
          }],
          is_active: true,
          client_id: clientId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return clientId ? mockWorkflows.filter(w => w.client_id === clientId) : mockWorkflows;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutation pour créer/modifier une règle (mockée pour l'instant)
  const createWorkflow = useMutation({
    mutationFn: async (workflow: Omit<WorkflowRule, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock création - en attendant la migration de la base de données
      const newWorkflow: WorkflowRule = {
        ...workflow,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return newWorkflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
      setIsCreating(false);
      toast({
        title: "Workflow créé",
        description: "Le workflow automatisé a été créé avec succès.",
      });
    },
  });

  // Mutation pour activer/désactiver une règle (mockée pour l'instant)
  const toggleWorkflow = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Mock update - en attendant la migration de la base de données
      return { id, is_active: isActive };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
      toast({
        title: "Workflow mis à jour",
        description: "Le statut du workflow a été modifié.",
      });
    },
  });

  // Workflows prédéfinis pour la croissance EOS
  const predefinedWorkflows = [
    {
      name: "Alerte baisse de revenus",
      description: "Crée automatiquement un issue EOS quand les revenus baissent de plus de 10%",
      trigger_type: "metric_threshold" as const,
      trigger_conditions: {
        metric: "revenue",
        operator: "percentage_change" as const,
        value: -10,
        timeframe: "week"
      },
      actions: [{
        type: "create_issue" as const,
        parameters: {
          title: "Baisse significative des revenus détectée",
          description: "Les revenus ont chuté de plus de 10% cette semaine. Investigation requise.",
          priority: 9
        }
      }]
    },
    {
      name: "Rock automatique - Amélioration satisfaction",
      description: "Crée un Rock quand la satisfaction client tombe sous 70",
      trigger_type: "metric_threshold" as const,
      trigger_conditions: {
        metric: "customer_satisfaction",
        operator: "less_than" as const,
        value: 70
      },
      actions: [{
        type: "create_rock" as const,
        parameters: {
          title: "Améliorer la satisfaction client",
          description: "Mettre en place des actions pour remonter la satisfaction client au-dessus de 80",
          due_date: "end_of_quarter"
        }
      }]
    },
    {
      name: "Alerte taux de churn critique",
      description: "Envoie une alerte critique quand le churn dépasse 5%",
      trigger_type: "metric_threshold" as const,
      trigger_conditions: {
        metric: "churn_rate",
        operator: "greater_than" as const,
        value: 5
      },
      actions: [{
        type: "send_alert" as const,
        parameters: {
          severity: "critical",
          message: "Taux de churn critique détecté - Action immédiate requise"
        }
      }]
    }
  ];

  const WorkflowForm = ({ workflow, onSave, onCancel }: {
    workflow?: WorkflowRule;
    onSave: (data: Omit<WorkflowRule, 'id' | 'created_at' | 'updated_at'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: workflow?.name || '',
      description: workflow?.description || '',
      trigger_type: workflow?.trigger_type || 'metric_threshold',
      trigger_conditions: workflow?.trigger_conditions || {},
      actions: workflow?.actions || [],
      is_active: workflow?.is_active ?? true,
      client_id: clientId
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>{workflow ? 'Modifier' : 'Créer'} un workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du workflow</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Alerte baisse revenus"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez ce que fait ce workflow..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Type de déclencheur</Label>
            <Select
              value={formData.trigger_type}
              onValueChange={(value) => setFormData({ ...formData, trigger_type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric_threshold">Seuil de métrique</SelectItem>
                <SelectItem value="trend_analysis">Analyse de tendance</SelectItem>
                <SelectItem value="time_based">Basé sur le temps</SelectItem>
                <SelectItem value="manual">Manuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="active">Workflow actif</Label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onSave(formData)}
              disabled={!formData.name || !formData.description}
            >
              {workflow ? 'Modifier' : 'Créer'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflows Automatisés EOS</h2>
          <p className="text-muted-foreground">
            Automatisez la création d'issues, rocks et alertes basées sur les métriques de croissance
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau workflow
        </Button>
      </div>

      {isCreating && (
        <WorkflowForm
          onSave={(data) => createWorkflow.mutate(data)}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingRule && (
        <WorkflowForm
          workflow={editingRule}
          onSave={(data) => {
            // TODO: Implement update mutation
            setEditingRule(null);
          }}
          onCancel={() => setEditingRule(null)}
        />
      )}

      {/* Workflows prédéfinis */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Workflows recommandés pour la croissance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedWorkflows.map((workflow, index) => (
            <Card key={index} className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Zap className="h-5 w-5 text-yellow-600 mt-1" />
                  <Badge variant="outline">Recommandé</Badge>
                </div>
                <h4 className="font-medium mb-2">{workflow.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => createWorkflow.mutate({
                    ...workflow,
                    client_id: clientId,
                    is_active: true
                  })}
                >
                  Activer ce workflow
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Workflows existants */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Workflows actifs</h3>
        {workflows && workflows.length > 0 ? (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{workflow.name}</h4>
                        <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                          {workflow.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Badge variant="outline">
                          {workflow.trigger_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {workflow.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Créé le {new Date(workflow.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleWorkflow.mutate({
                          id: workflow.id,
                          isActive: !workflow.is_active
                        })}
                      >
                        {workflow.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingRule(workflow)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun workflow configuré</h3>
              <p className="text-muted-foreground mb-4">
                Créez des workflows automatisés pour optimiser la croissance de vos clients avec l'EOS.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                Créer votre premier workflow
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
