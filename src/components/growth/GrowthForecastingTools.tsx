import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  Target, 
  Calculator, 
  Brain, 
  Zap,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  PlayCircle,
  Pause,
  RotateCcw
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

// Types pour les prévisions
interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  confidence: number;
  assumptions: {
    growth_rate: number;
    churn_rate: number;
    expansion_rate: number;
    new_clients_per_month: number;
    avg_deal_size: number;
  };
  results: {
    month: string;
    revenue: number;
    clients: number;
    mrr_growth: number;
  }[];
}

interface GrowthMetrics {
  current_mrr: number;
  growth_rate_monthly: number;
  churn_rate: number;
  expansion_rate: number;
  ltv: number;
  cac: number;
  ltv_cac_ratio: number;
  payback_period: number;
  net_revenue_retention: number;
}

// Mock data pour les prévisions
const mockGrowthMetrics: GrowthMetrics = {
  current_mrr: 125000,
  growth_rate_monthly: 8.5,
  churn_rate: 3.2,
  expansion_rate: 15.8,
  ltv: 45000,
  cac: 8500,
  ltv_cac_ratio: 5.3,
  payback_period: 14,
  net_revenue_retention: 112
};

const mockForecastScenarios: ForecastScenario[] = [
  {
    id: "conservative",
    name: "Conservateur",
    description: "Croissance modérée avec focus sur la rétention",
    confidence: 85,
    assumptions: {
      growth_rate: 5,
      churn_rate: 3,
      expansion_rate: 10,
      new_clients_per_month: 8,
      avg_deal_size: 2500
    },
    results: [
      { month: "Mar", revenue: 125000, clients: 45, mrr_growth: 5 },
      { month: "Avr", revenue: 131250, clients: 48, mrr_growth: 5 },
      { month: "Mai", revenue: 137813, clients: 51, mrr_growth: 5 },
      { month: "Jun", revenue: 144703, clients: 54, mrr_growth: 5 },
      { month: "Jul", revenue: 151938, clients: 57, mrr_growth: 5 },
      { month: "Aoû", revenue: 159535, clients: 60, mrr_growth: 5 }
    ]
  },
  {
    id: "optimistic",
    name: "Optimiste",
    description: "Croissance accélérée avec expansion forte",
    confidence: 65,
    assumptions: {
      growth_rate: 12,
      churn_rate: 2.5,
      expansion_rate: 20,
      new_clients_per_month: 15,
      avg_deal_size: 3200
    },
    results: [
      { month: "Mar", revenue: 125000, clients: 45, mrr_growth: 12 },
      { month: "Avr", revenue: 140000, clients: 52, mrr_growth: 12 },
      { month: "Mai", revenue: 156800, clients: 60, mrr_growth: 12 },
      { month: "Jun", revenue: 175616, clients: 68, mrr_growth: 12 },
      { month: "Jul", revenue: 196690, clients: 77, mrr_growth: 12 },
      { month: "Aoû", revenue: 220293, clients: 87, mrr_growth: 12 }
    ]
  },
  {
    id: "aggressive",
    name: "Agressif",
    description: "Croissance maximale avec investissement fort",
    confidence: 45,
    assumptions: {
      growth_rate: 18,
      churn_rate: 4,
      expansion_rate: 25,
      new_clients_per_month: 25,
      avg_deal_size: 4000
    },
    results: [
      { month: "Mar", revenue: 125000, clients: 45, mrr_growth: 18 },
      { month: "Avr", revenue: 147500, clients: 56, mrr_growth: 18 },
      { month: "Mai", revenue: 174050, clients: 69, mrr_growth: 18 },
      { month: "Jun", revenue: 205379, clients: 84, mrr_growth: 18 },
      { month: "Jul", revenue: 242347, clients: 102, mrr_growth: 18 },
      { month: "Aoû", revenue: 285970, clients: 124, mrr_growth: 18 }
    ]
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const GrowthForecastingTools = () => {
  const [selectedScenario, setSelectedScenario] = useState<ForecastScenario>(mockForecastScenarios[0]);
  const [customAssumptions, setCustomAssumptions] = useState(selectedScenario.assumptions);
  const [forecastPeriod, setForecastPeriod] = useState(6);
  const [activeTab, setActiveTab] = useState("scenarios");

  // Calculs de métriques avancées
  const calculateAdvancedMetrics = (scenario: ForecastScenario) => {
    const lastResult = scenario.results[scenario.results.length - 1];
    const firstResult = scenario.results[0];
    
    const totalGrowth = ((lastResult.revenue - firstResult.revenue) / firstResult.revenue) * 100;
    const avgMonthlyGrowth = totalGrowth / scenario.results.length;
    const projectedARR = lastResult.revenue * 12;
    const clientGrowth = ((lastResult.clients - firstResult.clients) / firstResult.clients) * 100;

    return {
      totalGrowth: totalGrowth.toFixed(1),
      avgMonthlyGrowth: avgMonthlyGrowth.toFixed(1),
      projectedARR: projectedARR,
      clientGrowth: clientGrowth.toFixed(1),
      revenuePerClient: (lastResult.revenue / lastResult.clients).toFixed(0)
    };
  };

  const metrics = calculateAdvancedMetrics(selectedScenario);

  // Données pour graphique comparatif
  const combinedData = useMemo(() => {
    const months = mockForecastScenarios[0].results.map(r => r.month);
    return months.map(month => {
      const dataPoint: any = { month };
      mockForecastScenarios.forEach(scenario => {
        const result = scenario.results.find(r => r.month === month);
        if (result) {
          dataPoint[scenario.name] = result.revenue;
        }
      });
      return dataPoint;
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🔮 Prévisions de Croissance
          </h2>
          <p className="text-muted-foreground">
            Modélisation avancée et planification stratégique
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          <Button variant="default" size="sm">
            <PlayCircle className="h-4 w-4 mr-2" />
            Lancer Simulation
          </Button>
        </div>
      </div>

      {/* Métriques actuelles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">MRR Actuel</span>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {mockGrowthMetrics.current_mrr.toLocaleString()}€
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Croissance Mensuelle</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {mockGrowthMetrics.growth_rate_monthly}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">LTV/CAC</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {mockGrowthMetrics.ltv_cac_ratio}x
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">NRR</span>
            </div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {mockGrowthMetrics.net_revenue_retention}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les différentes analyses */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scenarios">📊 Scénarios</TabsTrigger>
          <TabsTrigger value="modeling">🎯 Modélisation</TabsTrigger>
          <TabsTrigger value="sensitivity">⚡ Sensibilité</TabsTrigger>
          <TabsTrigger value="planning">📅 Planification</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sélecteur de scénarios */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Scénarios de Croissance</h3>
              {mockForecastScenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className={`cursor-pointer transition-all ${
                    selectedScenario.id === scenario.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <Badge variant="outline">
                        {scenario.confidence}% confiance
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {scenario.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Croissance:</span>
                        <span className="font-medium ml-1">{scenario.assumptions.growth_rate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Churn:</span>
                        <span className="font-medium ml-1">{scenario.assumptions.churn_rate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expansion:</span>
                        <span className="font-medium ml-1">{scenario.assumptions.expansion_rate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nouveaux:</span>
                        <span className="font-medium ml-1">{scenario.assumptions.new_clients_per_month}/mois</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Graphique du scénario sélectionné */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Projection Revenue - {selectedScenario.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={selectedScenario.results}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? `${value?.toLocaleString()}€` : value,
                          name === 'revenue' ? 'Revenue' : 'Clients'
                        ]}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        stroke="#3b82f6"
                      />
                      <Bar yAxisId="right" dataKey="clients" fill="#10b981" />
                      <ReferenceLine yAxisId="left" y={mockGrowthMetrics.current_mrr} stroke="#ef4444" strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Métriques du scénario sélectionné */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{metrics.totalGrowth}%</div>
                <div className="text-sm text-muted-foreground">Croissance Totale</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.projectedARR.toLocaleString()}€</div>
                <div className="text-sm text-muted-foreground">ARR Projeté</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.clientGrowth}%</div>
                <div className="text-sm text-muted-foreground">Croissance Clients</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.revenuePerClient}€</div>
                <div className="text-sm text-muted-foreground">Revenue/Client</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{selectedScenario.confidence}%</div>
                <div className="text-sm text-muted-foreground">Confiance</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modeling" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paramètres personnalisés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Modèle Personnalisé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="growth_rate">Taux de croissance (%)</Label>
                    <Input
                      id="growth_rate"
                      type="number"
                      value={customAssumptions.growth_rate}
                      onChange={(e) => setCustomAssumptions({
                        ...customAssumptions,
                        growth_rate: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="churn_rate">Taux de churn (%)</Label>
                    <Input
                      id="churn_rate"
                      type="number"
                      value={customAssumptions.churn_rate}
                      onChange={(e) => setCustomAssumptions({
                        ...customAssumptions,
                        churn_rate: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expansion_rate">Expansion rate (%)</Label>
                    <Input
                      id="expansion_rate"
                      type="number"
                      value={customAssumptions.expansion_rate}
                      onChange={(e) => setCustomAssumptions({
                        ...customAssumptions,
                        expansion_rate: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new_clients">Nouveaux clients/mois</Label>
                    <Input
                      id="new_clients"
                      type="number"
                      value={customAssumptions.new_clients_per_month}
                      onChange={(e) => setCustomAssumptions({
                        ...customAssumptions,
                        new_clients_per_month: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="deal_size">Taille moyenne deal (€)</Label>
                    <Input
                      id="deal_size"
                      type="number"
                      value={customAssumptions.avg_deal_size}
                      onChange={(e) => setCustomAssumptions({
                        ...customAssumptions,
                        avg_deal_size: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
                <Button className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculer Prévision Personnalisée
                </Button>
              </CardContent>
            </Card>

            {/* Comparaison des scénarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Comparaison Scénarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value?.toLocaleString()}€`, ""]} />
                    {mockForecastScenarios.map((scenario, index) => (
                      <Line
                        key={scenario.id}
                        type="monotone"
                        dataKey={scenario.name}
                        stroke={COLORS[index]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sensitivity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Analyse de Sensibilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Impact Churn +1%</span>
                    <Badge variant="destructive">-15k€ ARR</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Impact Expansion +5%</span>
                    <Badge className="bg-green-100 text-green-800">+32k€ ARR</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Impact Deal Size +500€</span>
                    <Badge className="bg-blue-100 text-blue-800">+18k€ ARR</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Impact +5 clients/mois</span>
                    <Badge className="bg-purple-100 text-purple-800">+45k€ ARR</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Recommandations IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Focus Expansion</p>
                    <p className="text-xs text-muted-foreground">
                      Le levier le plus impactant sur votre croissance
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Réduction Churn</p>
                    <p className="text-xs text-muted-foreground">
                      Priorité #1 pour maximiser la rentabilité
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Attention CAC</p>
                    <p className="text-xs text-muted-foreground">
                      Surveiller l'évolution du coût d'acquisition
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Plan de Croissance 2024
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { quarter: "Q2 2024", target: "150k€ MRR", actions: ["Launch Premium Tier", "Expand Sales Team"], status: "active" },
                    { quarter: "Q3 2024", target: "200k€ MRR", actions: ["International Expansion", "Partner Channel"], status: "planned" },
                    { quarter: "Q4 2024", target: "280k€ MRR", actions: ["Enterprise Features", "White Label"], status: "planned" },
                    { quarter: "Q1 2025", target: "350k€ MRR", actions: ["API Platform", "Marketplace"], status: "planned" }
                  ].map((plan, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          plan.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <h4 className="font-medium">{plan.quarter}</h4>
                          <p className="text-sm text-muted-foreground">
                            {plan.actions.join(" • ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{plan.target}</div>
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status === 'active' ? 'En cours' : 'Planifié'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎯 Objectifs 2024</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">ARR Target</span>
                    <span className="font-bold">3.5M€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Clients Target</span>
                    <span className="font-bold">150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">NRR Target</span>
                    <span className="font-bold">120%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Churn Target</span>
                    <span className="font-bold">&lt;2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚡ Actions Prioritaires</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Lancer Premium Tier
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Recruter Account Manager
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Optimiser Onboarding
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GrowthForecastingTools;