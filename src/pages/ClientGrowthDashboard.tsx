import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ClientJourneyTracker from "@/components/growth/ClientJourneyTracker";
import GrowthForecastingTools from "@/components/growth/GrowthForecastingTools";
import AutomationWorkflows from "@/components/growth/AutomationWorkflows";
import { 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Brain,
  Rocket,
  Trophy,
  Star,
  BarChart3,
  Bot,
  Map
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// Mock data - à remplacer par de vraies données Supabase
const mockGrowthData = {
  clients: [
    {
      id: "1",
      name: "TechCorp Inc.",
      mrr: 15000,
      growth_rate: 25,
      health_score: 92,
      stage: "expansion",
      next_milestone: "Q2 Scale-up",
      days_to_milestone: 45,
      risk_factors: [],
      opportunities: ["Upsell Premium", "Expansion Team"]
    },
    {
      id: "2", 
      name: "StartupXYZ",
      mrr: 3500,
      growth_rate: -5,
      health_score: 68,
      stage: "retention",
      next_milestone: "Churn Prevention",
      days_to_milestone: 15,
      risk_factors: ["Low engagement", "Payment delays"],
      opportunities: ["Re-engagement campaign"]
    }
  ],
  revenue_forecast: [
    { month: "Jan", actual: 45000, forecast: 47000, target: 50000 },
    { month: "Fév", actual: 48000, forecast: 52000, target: 55000 },
    { month: "Mar", actual: null, forecast: 58000, target: 60000 },
    { month: "Avr", actual: null, forecast: 65000, target: 65000 },
    { month: "Mai", actual: null, forecast: 72000, target: 70000 },
    { month: "Jun", actual: null, forecast: 80000, target: 75000 }
  ],
  growth_stages: [
    { stage: "Acquisition", clients: 12, value: 25000 },
    { stage: "Onboarding", clients: 8, value: 18000 },
    { stage: "Growth", clients: 15, value: 85000 },
    { stage: "Expansion", clients: 6, value: 120000 },
    { stage: "Retention", clients: 4, value: 35000 }
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ClientGrowthDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("6m");
  const [focusMetric, setFocusMetric] = useState("revenue");

  // Calculs de métriques clés
  const totalMRR = mockGrowthData.clients.reduce((sum, client) => sum + client.mrr, 0);
  const avgGrowthRate = mockGrowthData.clients.reduce((sum, client) => sum + client.growth_rate, 0) / mockGrowthData.clients.length;
  const avgHealthScore = mockGrowthData.clients.reduce((sum, client) => sum + client.health_score, 0) / mockGrowthData.clients.length;
  const atRiskClients = mockGrowthData.clients.filter(client => client.health_score < 70 || client.risk_factors.length > 0).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header avec métriques clés */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            🚀 Cockpit Croissance Client
          </h1>
          <p className="text-muted-foreground mt-2">
            Pilotez la croissance structurée de votre portefeuille client
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedTimeframe("3m")}>
            3M
          </Button>
          <Button 
            variant={selectedTimeframe === "6m" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedTimeframe("6m")}
          >
            6M
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedTimeframe("12m")}>
            12M
          </Button>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              MRR Total
            </CardTitle>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              {totalMRR.toLocaleString()}€
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">+{avgGrowthRate.toFixed(1)}%</span>
              <span className="text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Santé Moyenne
            </CardTitle>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {avgHealthScore.toFixed(0)}%
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={avgHealthScore} className="h-2" />
            <div className="text-sm text-muted-foreground mt-2">
              Excellente santé globale
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              Clients à Risque
            </CardTitle>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
              {atRiskClients}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Nécessitent attention immédiate
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Objectif Atteint
            </CardTitle>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              87%
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={87} className="h-2" />
            <div className="text-sm text-muted-foreground mt-2">
              Sur la bonne trajectoire
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et Analyses */}
      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="forecast">📈 Prévisions</TabsTrigger>
          <TabsTrigger value="pipeline">🎯 Pipeline</TabsTrigger>
          <TabsTrigger value="health">💚 Santé Client</TabsTrigger>
          <TabsTrigger value="opportunities">🚀 Opportunités</TabsTrigger>
          <TabsTrigger value="journey">🛤️ Parcours</TabsTrigger>
          <TabsTrigger value="automation">🤖 Automatisation</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Prévision Revenue 6 Mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockGrowthData.revenue_forecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value?.toLocaleString()}€`, ""]} />
                    <Area type="monotone" dataKey="target" stackId="1" stroke="#e5e7eb" fill="#f3f4f6" name="Objectif" />
                    <Area type="monotone" dataKey="forecast" stackId="2" stroke="#3b82f6" fill="#dbeafe" name="Prévision" />
                    <Area type="monotone" dataKey="actual" stackId="3" stroke="#10b981" fill="#d1fae5" name="Réalisé" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Répartition par Étape
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockGrowthData.growth_stages}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ stage, clients }) => `${stage} (${clients})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockGrowthData.growth_stages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value?.toLocaleString()}€`, "Valeur"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Pipeline de Croissance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGrowthData.growth_stages.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full bg-${COLORS[index]}`} style={{ backgroundColor: COLORS[index] }} />
                      <div>
                        <h3 className="font-medium">{stage.stage}</h3>
                        <p className="text-sm text-muted-foreground">{stage.clients} clients</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{stage.value.toLocaleString()}€</div>
                      <div className="text-sm text-muted-foreground">
                        {(stage.value / mockGrowthData.growth_stages.reduce((sum, s) => sum + s.value, 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockGrowthData.clients.map((client) => (
              <Card key={client.id} className={`${client.health_score < 70 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <Badge variant={client.health_score >= 70 ? "default" : "destructive"}>
                      {client.health_score}% santé
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">MRR</p>
                      <p className="font-bold">{client.mrr.toLocaleString()}€</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Croissance</p>
                      <p className={`font-bold ${client.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {client.growth_rate > 0 ? '+' : ''}{client.growth_rate}%
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Prochain jalon</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{client.next_milestone}</span>
                      <Badge variant="outline">{client.days_to_milestone}j</Badge>
                    </div>
                  </div>

                  {client.risk_factors.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">⚠️ Facteurs de risque</p>
                      <div className="space-y-1">
                        {client.risk_factors.map((risk, idx) => (
                          <Badge key={idx} variant="destructive" className="mr-2">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {client.opportunities.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">🚀 Opportunités</p>
                      <div className="space-y-1">
                        {client.opportunities.map((opp, idx) => (
                          <Badge key={idx} variant="secondary" className="mr-2">
                            {opp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Rocket className="h-5 w-5" />
                  Expansion Immédiate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>TechCorp Inc.</span>
                    <Badge className="bg-emerald-100 text-emerald-800">+45k€</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>MegaCorp Ltd.</span>
                    <Badge className="bg-emerald-100 text-emerald-800">+32k€</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Potentiel total: 77k€</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Brain className="h-5 w-5" />
                  Rétention Critique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>StartupXYZ</span>
                    <Badge variant="destructive">Risque élevé</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>SmallBiz Co.</span>
                    <Badge variant="outline">Attention</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Actions requises: 2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Star className="h-5 w-5" />
                  Cross-sell Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>GrowthCorp</span>
                    <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>ScaleCo</span>
                    <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Revenue pot: 28k€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey">
          <ClientJourneyTracker />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationWorkflows />
        </TabsContent>
      </Tabs>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions Rapides Recommandées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex-col items-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5" />
                <span className="font-medium">Expansion TechCorp</span>
              </div>
              <p className="text-sm opacity-90 text-left">
                Proposer upgrade Premium (+45k€ ARR)
              </p>
            </Button>

            <Button variant="destructive" className="h-auto p-4 flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Urgence StartupXYZ</span>
              </div>
              <p className="text-sm opacity-90 text-left">
                Planifier call de rétention immédiat
              </p>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Reviews Trimestrielles</span>
              </div>
              <p className="text-sm text-left">
                Programmer 8 QBR ce mois
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section Outils Avancés */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Outils de Croissance Avancés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-6 flex-col items-start hover:bg-blue-50 dark:hover:bg-blue-950"
              onClick={() => window.open('/clients/growth?tab=forecasting', '_blank')}
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">Modélisation Financière</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Prévisions avancées, scénarios de croissance et analyse de sensibilité
              </p>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-6 flex-col items-start hover:bg-green-50 dark:hover:bg-green-950"
              onClick={() => window.open('/clients/growth?tab=journey', '_blank')}
            >
              <div className="flex items-center gap-2 mb-3">
                <Map className="h-6 w-6 text-green-600" />
                <span className="font-semibold">Journey Mapping</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Suivi détaillé des parcours clients avec milestones et interventions
              </p>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-6 flex-col items-start hover:bg-purple-50 dark:hover:bg-purple-950"
              onClick={() => window.open('/clients/growth?tab=automation', '_blank')}
            >
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-6 w-6 text-purple-600" />
                <span className="font-semibold">Automatisation IA</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Workflows intelligents et actions automatisées basées sur les données
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Page dédiée aux outils avancés
export const AdvancedGrowthTools = () => {
  const [activeTab, setActiveTab] = useState("forecasting");

  // Récupérer le tab depuis l'URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['forecasting', 'journey', 'automation'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            🚀 Outils de Croissance Avancés
          </h1>
          <p className="text-muted-foreground mt-2">
            Suite complète d'outils pour optimiser et automatiser la croissance client
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecasting" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Modélisation
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Parcours Client
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Automatisation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting">
          <GrowthForecastingTools />
        </TabsContent>

        <TabsContent value="journey">
          <ClientJourneyTracker />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationWorkflows />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientGrowthDashboard;