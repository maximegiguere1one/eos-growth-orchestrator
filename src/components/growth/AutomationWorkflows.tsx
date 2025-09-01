import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Bot, 
  Bell, 
  Calendar, 
  Mail, 
  MessageSquare,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Filter,
  ArrowRight,
  Brain,
  Rocket,
  Shield,
  Activity
} from "lucide-react";

// Types pour les workflows
interface WorkflowTrigger {
  id: string;
  type: 'health_score' | 'milestone' | 'engagement' | 'revenue' | 'time_based' | 'manual';
  name: string;
  description: string;
  condition: string;
  icon: React.ReactNode;
}

interface WorkflowAction {
  id: string;
  type: 'notification' | 'email' | 'task' | 'meeting' | 'update_field' | 'webhook';
  name: string;
  description: string;
  config: any;
  icon: React.ReactNode;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'retention' | 'expansion' | 'health' | 'revenue';
  is_active: boolean;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  execution_count: number;
  success_rate: number;
  last_executed?: string;
  impact_metrics?: {
    clients_affected: number;
    revenue_impact: number;
    time_saved: number;
  };
}

// Mock data pour les workflows
const mockWorkflows: AutomationWorkflow[] = [
  {
    id: "1",
    name: "Alerte Santé Client Critique",
    description: "Déclenche des actions immédiates quand un client passe en zone rouge",
    category: "health",
    is_active: true,
    triggers: [
      {
        id: "t1",
        type: "health_score",
        name: "Score santé < 60",
        description: "Se déclenche quand le score santé descend sous 60%",
        condition: "health_score < 60",
        icon: <AlertTriangle className="h-4 w-4" />
      }
    ],
    actions: [
      {
        id: "a1",
        type: "notification",
        name: "Notification urgente AM",
        description: "Notifie immédiatement l'Account Manager",
        config: { urgency: "high", recipients: ["account_manager"] },
        icon: <Bell className="h-4 w-4" />
      },
      {
        id: "a2",
        type: "task",
        name: "Créer tâche intervention",
        description: "Crée une tâche prioritaire d'intervention client",
        config: { priority: "high", assignee: "account_manager", due_days: 1 },
        icon: <Target className="h-4 w-4" />
      },
      {
        id: "a3",
        type: "email",
        name: "Email de suivi client",
        description: "Envoie un email personnalisé au client",
        config: { template: "health_check", delay_hours: 2 },
        icon: <Mail className="h-4 w-4" />
      }
    ],
    execution_count: 23,
    success_rate: 87,
    last_executed: "2024-03-10T14:30:00Z",
    impact_metrics: {
      clients_affected: 8,
      revenue_impact: 45000,
      time_saved: 12
    }
  },
  {
    id: "2",
    name: "Onboarding Progressif",
    description: "Guide automatique des nouveaux clients à travers les étapes d'onboarding",
    category: "onboarding",
    is_active: true,
    triggers: [
      {
        id: "t2",
        type: "milestone",
        name: "Nouveau client créé",
        description: "Se déclenche à la création d'un nouveau client",
        condition: "client_status == 'onboarding'",
        icon: <Users className="h-4 w-4" />
      }
    ],
    actions: [
      {
        id: "a4",
        type: "email",
        name: "Email de bienvenue",
        description: "Envoie la séquence d'emails de bienvenue",
        config: { template: "welcome_series", sequence: true },
        icon: <Mail className="h-4 w-4" />
      },
      {
        id: "a5",
        type: "meeting",
        name: "Planifier kick-off",
        description: "Programme automatiquement le meeting de kick-off",
        config: { type: "kick_off", delay_days: 2 },
        icon: <Calendar className="h-4 w-4" />
      },
      {
        id: "a6",
        type: "task",
        name: "Checklist onboarding",
        description: "Crée la checklist d'onboarding personnalisée",
        config: { template: "onboarding_checklist" },
        icon: <CheckCircle className="h-4 w-4" />
      }
    ],
    execution_count: 156,
    success_rate: 94,
    last_executed: "2024-03-12T09:15:00Z",
    impact_metrics: {
      clients_affected: 42,
      revenue_impact: 125000,
      time_saved: 35
    }
  },
  {
    id: "3",
    name: "Détection Opportunité Upsell",
    description: "Identifie automatiquement les opportunités d'expansion",
    category: "expansion",
    is_active: true,
    triggers: [
      {
        id: "t3",
        type: "engagement",
        name: "Usage élevé",
        description: "Usage > 80% du quota pendant 30 jours",
        condition: "usage_rate > 80 AND duration > 30 days",
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        id: "t4",
        type: "revenue",
        name: "ROI positif",
        description: "ROI client > 200%",
        condition: "roi > 200",
        icon: <DollarSign className="h-4 w-4" />
      }
    ],
    actions: [
      {
        id: "a7",
        type: "notification",
        name: "Alerte équipe sales",
        description: "Notifie l'équipe sales de l'opportunité",
        config: { recipients: ["sales_team"], include_metrics: true },
        icon: <Bell className="h-4 w-4" />
      },
      {
        id: "a8",
        type: "task",
        name: "Préparer proposition upsell",
        description: "Crée une tâche de préparation de proposition",
        config: { template: "upsell_preparation", assignee: "account_manager" },
        icon: <Target className="h-4 w-4" />
      }
    ],
    execution_count: 89,
    success_rate: 76,
    last_executed: "2024-03-11T16:45:00Z",
    impact_metrics: {
      clients_affected: 15,
      revenue_impact: 89000,
      time_saved: 8
    }
  },
  {
    id: "4",
    name: "Suivi Milestone Automatique",
    description: "Suit automatiquement les jalons et relance si nécessaire",
    category: "retention",
    is_active: true,
    triggers: [
      {
        id: "t5",
        type: "time_based",
        name: "Milestone en retard",
        description: "Jalon dépassé de plus de 3 jours",
        condition: "milestone.due_date < today() - 3 days",
        icon: <Clock className="h-4 w-4" />
      }
    ],
    actions: [
      {
        id: "a9",
        type: "notification",
        name: "Alerte retard milestone",
        description: "Notifie le retard sur le milestone",
        config: { urgency: "medium", recipients: ["account_manager", "client"] },
        icon: <Bell className="h-4 w-4" />
      },
      {
        id: "a10",
        type: "meeting",
        name: "Meeting de déblocage",
        description: "Programme un meeting pour débloquer la situation",
        config: { type: "milestone_review", urgency: "high" },
        icon: <Calendar className="h-4 w-4" />
      }
    ],
    execution_count: 67,
    success_rate: 82,
    last_executed: "2024-03-09T11:20:00Z",
    impact_metrics: {
      clients_affected: 12,
      revenue_impact: 34000,
      time_saved: 15
    }
  }
];

const mockWorkflowStats = {
  total_workflows: 12,
  active_workflows: 9,
  total_executions: 1247,
  success_rate: 86,
  time_saved_hours: 156,
  revenue_impact: 745000,
  clients_impacted: 89
};

const AutomationWorkflows = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [workflows, setWorkflows] = useState(mockWorkflows);

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(workflows.map(w => 
      w.id === workflowId ? { ...w, is_active: !w.is_active } : w
    ));
  };

  const filteredWorkflows = selectedCategory === "all" 
    ? workflows 
    : workflows.filter(w => w.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding': return <Users className="h-4 w-4" />;
      case 'retention': return <Shield className="h-4 w-4" />;
      case 'expansion': return <Rocket className="h-4 w-4" />;
      case 'health': return <Activity className="h-4 w-4" />;
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'onboarding': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'retention': return 'bg-green-100 text-green-800 border-green-300';
      case 'expansion': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'health': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'revenue': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤖 Workflows d'Automatisation
          </h2>
          <p className="text-muted-foreground">
            Automatisez vos processus de croissance client
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurer
          </Button>
          <Button variant="default" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Nouveau Workflow
          </Button>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Workflows Actifs</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {mockWorkflowStats.active_workflows}/{mockWorkflowStats.total_workflows}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Taux de Succès</span>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {mockWorkflowStats.success_rate}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Temps Économisé</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {mockWorkflowStats.time_saved_hours}h
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">Impact Revenue</span>
            </div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {(mockWorkflowStats.revenue_impact / 1000).toFixed(0)}k€
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="workflows">⚡ Workflows</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          <TabsTrigger value="builder">🔧 Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Workflows par catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['onboarding', 'retention', 'expansion', 'health', 'revenue'].map((category) => {
              const categoryWorkflows = workflows.filter(w => w.category === category);
              const activeCount = categoryWorkflows.filter(w => w.is_active).length;
              const totalExecutions = categoryWorkflows.reduce((sum, w) => sum + w.execution_count, 0);
              const avgSuccessRate = categoryWorkflows.reduce((sum, w) => sum + w.success_rate, 0) / categoryWorkflows.length;

              return (
                <Card key={category} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg capitalize">
                      {getCategoryIcon(category)}
                      {category === 'onboarding' ? 'Onboarding' :
                       category === 'retention' ? 'Rétention' :
                       category === 'expansion' ? 'Expansion' :
                       category === 'health' ? 'Santé' : 'Revenue'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Workflows</p>
                        <p className="font-bold">{activeCount}/{categoryWorkflows.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Exécutions</p>
                        <p className="font-bold">{totalExecutions}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taux de succès</span>
                        <span>{avgSuccessRate.toFixed(0)}%</span>
                      </div>
                      <Progress value={avgSuccessRate} className="h-2" />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedCategory(category);
                        setActiveTab("workflows");
                      }}
                    >
                      Voir détails
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Workflows récents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflows
                  .filter(w => w.last_executed)
                  .sort((a, b) => new Date(b.last_executed!).getTime() - new Date(a.last_executed!).getTime())
                  .slice(0, 5)
                  .map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${workflow.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Dernière exécution: {new Date(workflow.last_executed!).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(workflow.category)}>
                        {workflow.category}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          {/* Filtres */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Catégorie:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                Tous
              </Button>
              {['onboarding', 'retention', 'expansion', 'health', 'revenue'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1">
                    {category === 'onboarding' ? 'Onboarding' :
                     category === 'retention' ? 'Rétention' :
                     category === 'expansion' ? 'Expansion' :
                     category === 'health' ? 'Santé' : 'Revenue'}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Liste des workflows */}
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className={`${workflow.is_active ? '' : 'opacity-60'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={() => toggleWorkflow(workflow.id)}
                      />
                      <div>
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(workflow.category)}>
                        {getCategoryIcon(workflow.category)}
                        <span className="ml-1 capitalize">{workflow.category}</span>
                      </Badge>
                      {workflow.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Play className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Pause className="h-3 w-3 mr-1" />
                          Inactif
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Triggers */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Déclencheurs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.triggers.map((trigger) => (
                        <div key={trigger.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          {trigger.icon}
                          <span className="text-sm">{trigger.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Actions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.actions.map((action, index) => (
                        <div key={action.id} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                            {action.icon}
                            <span className="text-sm">{action.name}</span>
                          </div>
                          {index < workflow.actions.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Métriques */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{workflow.execution_count}</div>
                      <div className="text-sm text-muted-foreground">Exécutions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{workflow.success_rate}%</div>
                      <div className="text-sm text-muted-foreground">Succès</div>
                    </div>
                    {workflow.impact_metrics && (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{workflow.impact_metrics.clients_affected}</div>
                          <div className="text-sm text-muted-foreground">Clients</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {(workflow.impact_metrics.revenue_impact / 1000).toFixed(0)}k€
                          </div>
                          <div className="text-sm text-muted-foreground">Impact</div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Performance par Catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['onboarding', 'retention', 'expansion', 'health', 'revenue'].map((category) => {
                    const categoryWorkflows = workflows.filter(w => w.category === category);
                    const avgSuccessRate = categoryWorkflows.reduce((sum, w) => sum + w.success_rate, 0) / categoryWorkflows.length;
                    const totalExecutions = categoryWorkflows.reduce((sum, w) => sum + w.execution_count, 0);

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="font-medium capitalize">
                              {category === 'onboarding' ? 'Onboarding' :
                               category === 'retention' ? 'Rétention' :
                               category === 'expansion' ? 'Expansion' :
                               category === 'health' ? 'Santé' : 'Revenue'}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {avgSuccessRate.toFixed(0)}% • {totalExecutions} exec.
                          </div>
                        </div>
                        <Progress value={avgSuccessRate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Impact Business
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {mockWorkflowStats.clients_impacted}
                    </div>
                    <div className="text-sm text-muted-foreground">Clients Impactés</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(mockWorkflowStats.revenue_impact / 1000).toFixed(0)}k€
                    </div>
                    <div className="text-sm text-muted-foreground">Revenue Impact</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {mockWorkflowStats.time_saved_hours}h
                    </div>
                    <div className="text-sm text-muted-foreground">Temps Économisé</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {mockWorkflowStats.total_executions}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Exécutions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Créateur de Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Builder de Workflow Visuel</h3>
              <p className="text-muted-foreground mb-6">
                Créez des workflows personnalisés avec notre interface drag & drop
              </p>
              <Button size="lg">
                <Zap className="h-4 w-4 mr-2" />
                Lancer le Builder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationWorkflows;