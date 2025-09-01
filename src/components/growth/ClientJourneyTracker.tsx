import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Star,
  Zap,
  Brain,
  Rocket,
  Trophy
} from "lucide-react";

// Types pour le parcours client
interface JourneyStage {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  success_criteria: string[];
  actions: string[];
  status: 'pending' | 'active' | 'completed' | 'at_risk';
  completion_percentage: number;
  start_date?: string;
  expected_end_date?: string;
  actual_end_date?: string;
}

interface ClientJourney {
  client_id: string;
  client_name: string;
  current_stage: string;
  overall_progress: number;
  health_score: number;
  stages: JourneyStage[];
  milestones: {
    id: string;
    title: string;
    date: string;
    status: 'completed' | 'upcoming' | 'overdue';
    impact: 'low' | 'medium' | 'high';
  }[];
  risk_factors: string[];
  opportunities: string[];
  next_actions: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    due_date: string;
    assigned_to?: string;
  }[];
}

// Mock data - à remplacer par de vraies données
const mockClientJourneys: ClientJourney[] = [
  {
    client_id: "1",
    client_name: "TechCorp Inc.",
    current_stage: "expansion",
    overall_progress: 78,
    health_score: 92,
    stages: [
      {
        id: "onboarding",
        name: "Onboarding",
        description: "Configuration initiale et formation équipe",
        duration_days: 30,
        success_criteria: ["Formation terminée", "Premier projet lancé", "Équipe autonome"],
        actions: ["Kick-off meeting", "Formation utilisateurs", "Setup technique"],
        status: 'completed',
        completion_percentage: 100,
        start_date: "2024-01-15",
        actual_end_date: "2024-02-10"
      },
      {
        id: "adoption",
        name: "Adoption",
        description: "Montée en compétence et usage régulier",
        duration_days: 60,
        success_criteria: ["Usage quotidien", "ROI positif", "Satisfaction >80%"],
        actions: ["Suivi hebdomadaire", "Optimisations", "Formation avancée"],
        status: 'completed',
        completion_percentage: 100,
        start_date: "2024-02-10",
        actual_end_date: "2024-04-05"
      },
      {
        id: "growth",
        name: "Croissance",
        description: "Expansion d'usage et optimisation",
        duration_days: 90,
        success_criteria: ["Usage étendu", "Nouvelles équipes", "Processus optimisés"],
        actions: ["Analyse performance", "Nouvelles fonctionnalités", "Scale-up"],
        status: 'completed',
        completion_percentage: 100,
        start_date: "2024-04-05",
        actual_end_date: "2024-06-20"
      },
      {
        id: "expansion",
        name: "Expansion",
        description: "Extension à de nouveaux départements",
        duration_days: 120,
        success_criteria: ["Multi-départements", "ROI x2", "Advocacy"],
        actions: ["Déploiement étendu", "Formation managers", "Success stories"],
        status: 'active',
        completion_percentage: 65,
        start_date: "2024-06-20",
        expected_end_date: "2024-10-18"
      },
      {
        id: "advocacy",
        name: "Advocacy",
        description: "Client ambassadeur et référence",
        duration_days: 60,
        success_criteria: ["Témoignage public", "Référencement", "Cas d'étude"],
        actions: ["Case study", "Événements", "Partenariat"],
        status: 'pending',
        completion_percentage: 0
      }
    ],
    milestones: [
      {
        id: "1",
        title: "Go-live Production",
        date: "2024-02-01",
        status: 'completed',
        impact: 'high'
      },
      {
        id: "2",
        title: "ROI Break-even",
        date: "2024-03-15",
        status: 'completed',
        impact: 'high'
      },
      {
        id: "3",
        title: "Expansion Dept. Sales",
        date: "2024-08-01",
        status: 'upcoming',
        impact: 'medium'
      },
      {
        id: "4",
        title: "Case Study Publication",
        date: "2024-09-30",
        status: 'upcoming',
        impact: 'high'
      }
    ],
    risk_factors: [],
    opportunities: ["Upsell Premium Package", "Expansion to subsidiaries"],
    next_actions: [
      {
        action: "Préparer démo pour équipe Sales",
        priority: 'high',
        due_date: "2024-03-15",
        assigned_to: "Sarah M."
      },
      {
        action: "Planifier QBR Q2",
        priority: 'medium',
        due_date: "2024-03-20"
      }
    ]
  },
  {
    client_id: "2",
    client_name: "StartupXYZ",
    current_stage: "adoption",
    overall_progress: 45,
    health_score: 68,
    stages: [
      {
        id: "onboarding",
        name: "Onboarding",
        description: "Configuration initiale et formation équipe",
        duration_days: 30,
        success_criteria: ["Formation terminée", "Premier projet lancé", "Équipe autonome"],
        actions: ["Kick-off meeting", "Formation utilisateurs", "Setup technique"],
        status: 'completed',
        completion_percentage: 100,
        start_date: "2024-02-01",
        actual_end_date: "2024-02-25"
      },
      {
        id: "adoption",
        name: "Adoption",
        description: "Montée en compétence et usage régulier",
        duration_days: 60,
        success_criteria: ["Usage quotidien", "ROI positif", "Satisfaction >80%"],
        actions: ["Suivi hebdomadaire", "Optimisations", "Formation avancée"],
        status: 'at_risk',
        completion_percentage: 40,
        start_date: "2024-02-25",
        expected_end_date: "2024-04-25"
      }
    ],
    milestones: [
      {
        id: "1",
        title: "Première campagne lancée",
        date: "2024-02-20",
        status: 'completed',
        impact: 'medium'
      },
      {
        id: "2",
        title: "Formation équipe terminée",
        date: "2024-03-10",
        status: 'overdue',
        impact: 'high'
      }
    ],
    risk_factors: ["Faible engagement équipe", "Retard formation", "Budget serré"],
    opportunities: ["Formation personnalisée", "Success manager dédié"],
    next_actions: [
      {
        action: "Call d'urgence avec CEO",
        priority: 'high',
        due_date: "2024-03-12",
        assigned_to: "John D."
      },
      {
        action: "Plan de rattrapage formation",
        priority: 'high',
        due_date: "2024-03-15"
      }
    ]
  }
];

const ClientJourneyTracker = () => {
  const [selectedClient, setSelectedClient] = useState<ClientJourney>(mockClientJourneys[0]);
  const [activeTab, setActiveTab] = useState("journey");

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'active':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case 'at_risk':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'at_risk':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de client */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Parcours Client</h2>
          <p className="text-muted-foreground">Suivi détaillé des étapes de croissance</p>
        </div>
        <div className="flex gap-2">
          {mockClientJourneys.map((client) => (
            <Button
              key={client.client_id}
              variant={selectedClient.client_id === client.client_id ? "default" : "outline"}
              onClick={() => setSelectedClient(client)}
              className="flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${
                client.health_score >= 80 ? 'bg-green-500' : 
                client.health_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              {client.client_name}
            </Button>
          ))}
        </div>
      </div>

      {/* Vue d'ensemble du client sélectionné */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {selectedClient.client_name}
                <Badge className={getStatusColor(selectedClient.stages.find(s => s.id === selectedClient.current_stage)?.status || 'pending')}>
                  {selectedClient.current_stage}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Progression globale: {selectedClient.overall_progress}% • Santé: {selectedClient.health_score}%
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{selectedClient.health_score}%</div>
              <div className="text-sm text-muted-foreground">Score santé</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={selectedClient.overall_progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Tabs pour les différentes vues */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="journey">🛤️ Parcours</TabsTrigger>
          <TabsTrigger value="milestones">🎯 Jalons</TabsTrigger>
          <TabsTrigger value="actions">⚡ Actions</TabsTrigger>
          <TabsTrigger value="insights">🧠 Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="space-y-4">
          <div className="space-y-6">
            {selectedClient.stages.map((stage, index) => (
              <Card key={stage.id} className={`${stage.status === 'at_risk' ? 'border-red-300 bg-red-50 dark:bg-red-950' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStageIcon(stage.status)}
                      <div>
                        <CardTitle className="text-lg">{stage.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(stage.status)}>
                        {stage.completion_percentage}%
                      </Badge>
                      {index < selectedClient.stages.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={stage.completion_percentage} className="h-2" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">✅ Critères de succès</h4>
                      <ul className="space-y-1">
                        {stage.success_criteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">🎬 Actions clés</h4>
                      <ul className="space-y-1">
                        {stage.actions.map((action, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Target className="h-3 w-3 text-blue-600" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {stage.status === 'at_risk' && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Attention requise</span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Cette étape nécessite une intervention immédiate pour éviter les retards.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Durée prévue: {stage.duration_days} jours</span>
                    {stage.start_date && (
                      <span>
                        Début: {new Date(stage.start_date).toLocaleDateString('fr-FR')}
                        {stage.expected_end_date && (
                          <> • Fin prévue: {new Date(stage.expected_end_date).toLocaleDateString('fr-FR')}</>
                        )}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedClient.milestones.map((milestone) => (
              <Card key={milestone.id} className={milestone.status === 'overdue' ? 'border-red-300' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getMilestoneIcon(milestone.status)}
                      <div>
                        <h3 className="font-medium">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(milestone.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={milestone.status === 'completed' ? 'default' : milestone.status === 'overdue' ? 'destructive' : 'secondary'}
                      >
                        {milestone.status === 'completed' ? 'Terminé' : 
                         milestone.status === 'overdue' ? 'En retard' : 'À venir'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Impact {milestone.impact}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Actions Prioritaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedClient.next_actions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{action.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {action.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(action.due_date).toLocaleDateString('fr-FR')}
                        </span>
                        {action.assigned_to && (
                          <Badge variant="outline" className="text-xs">
                            {action.assigned_to}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Marquer fait
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              {selectedClient.risk_factors.length > 0 && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5" />
                      Facteurs de Risque
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedClient.risk_factors.map((risk, index) => (
                      <Badge key={index} variant="destructive" className="mr-2 mb-2">
                        {risk}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}

              {selectedClient.opportunities.length > 0 && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Rocket className="h-5 w-5" />
                      Opportunités
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedClient.opportunities.map((opportunity, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 mr-2 mb-2">
                        {opportunity}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Brain className="h-5 w-5" />
                  Analyse Comportementale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Engagement</span>
                    <span className="font-medium">Élevé</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Adoption</span>
                    <span className="font-medium">Progressive</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Satisfaction</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="h-5 w-5" />
                  Prédictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Succès probable</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Expansion likely</span>
                    <span className="font-medium text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Churn risk</span>
                    <span className="font-medium text-red-600">3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Trophy className="h-5 w-5" />
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• Accélérer formation équipe Sales</p>
                  <p className="text-sm">• Préparer case study</p>
                  <p className="text-sm">• Planifier upsell Premium</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientJourneyTracker;