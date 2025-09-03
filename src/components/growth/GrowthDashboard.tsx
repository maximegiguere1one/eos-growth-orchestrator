import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Users,
  DollarSign,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Lightbulb
} from 'lucide-react';
import {
  useClientGrowthMetrics,
  useGrowthAlerts,
  useGrowthRecommendations,
  useResolveAlert,
  useImplementRecommendation,
  calculateHealthScore,
  getHealthStatus
} from '@/hooks/useGrowthTrackingMock';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface GrowthDashboardProps {
  clientId: string;
  clientName: string;
}

export const GrowthDashboard: React.FC<GrowthDashboardProps> = ({ clientId, clientName }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'4w' | '12w' | '52w'>('12w');
  
  const { data: metrics, isLoading: metricsLoading } = useClientGrowthMetrics(clientId);
  const { data: alerts, isLoading: alertsLoading } = useGrowthAlerts(clientId);
  const { data: recommendations, isLoading: recommendationsLoading } = useGrowthRecommendations(clientId);
  
  const resolveAlert = useResolveAlert();
  const implementRecommendation = useImplementRecommendation();
  // Mock function for generating recommendations
  const generateRecommendations = () => {
    console.log('Generating EOS recommendations...');
  };

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const latestMetrics = metrics?.[0];
  const previousMetrics = metrics?.[1];
  
  if (!latestMetrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground mb-4">
            Aucune donnée de croissance disponible pour {clientName}
          </div>
          <Button onClick={() => generateRecommendations.mutate(clientId)}>
            Initialiser le suivi de croissance
          </Button>
        </CardContent>
      </Card>
    );
  }

  const healthScore = calculateHealthScore(latestMetrics);
  const healthStatus = getHealthStatus(healthScore);
  
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5" />;
      case 'good': return <TrendingUp className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <TrendingDown className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatChange = (change: number) => {
    const isPositive = change > 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(change).toFixed(1)}%
      </div>
    );
  };

  const chartData = metrics?.slice(0, 12).reverse().map(m => ({
    week: new Date(m.week_start_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    revenue: m.revenue,
    users: m.active_users,
    satisfaction: m.customer_satisfaction,
    healthScore: calculateHealthScore(m)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header avec score de santé global */}
      <Card className={`border-2 ${getHealthColor(healthStatus)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getHealthIcon(healthStatus)}
                Santé de croissance - {clientName}
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Score global: {healthScore}/100
              </div>
            </div>
            <div className="text-right">
              <Badge variant={healthStatus === 'excellent' ? 'default' : healthStatus === 'good' ? 'secondary' : 'destructive'}>
                {healthStatus.toUpperCase()}
              </Badge>
              <Progress value={healthScore} className="w-32 mt-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold">{latestMetrics.revenue.toLocaleString('fr-FR')}€</p>
                {previousMetrics && formatChange(calculateChange(latestMetrics.revenue, previousMetrics.revenue))}
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</p>
                <p className="text-2xl font-bold">{latestMetrics.active_users.toLocaleString('fr-FR')}</p>
                {previousMetrics && formatChange(calculateChange(latestMetrics.active_users, previousMetrics.active_users))}
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de conversion</p>
                <p className="text-2xl font-bold">{latestMetrics.conversion_rate.toFixed(1)}%</p>
                {previousMetrics && formatChange(calculateChange(latestMetrics.conversion_rate, previousMetrics.conversion_rate))}
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{latestMetrics.customer_satisfaction}/100</p>
                {previousMetrics && formatChange(calculateChange(latestMetrics.customer_satisfaction, previousMetrics.customer_satisfaction))}
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et alertes */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertes {alerts && alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">{alerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommandations {recommendations && recommendations.length > 0 && (
              <Badge variant="secondary" className="ml-2">{recommendations.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des métriques (12 dernières semaines)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="healthScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction client</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="satisfaction" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
              <Alert key={alert.id} className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'high' ? 'border-l-orange-500' :
                alert.severity === 'medium' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{alert.message}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Créé le {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {alert.recommended_actions.length > 0 && (
                        <div className="text-sm">
                          <strong>Actions recommandées:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {alert.recommended_actions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'high' ? 'destructive' :
                        alert.severity === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {alert.severity}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert.mutate(alert.id)}
                        disabled={resolveAlert.isPending}
                      >
                        Résoudre
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune alerte active</h3>
                <p className="text-muted-foreground">Toutes les métriques sont dans les normes acceptables.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recommandations EOS pour la croissance</h3>
            <Button
              onClick={() => generateRecommendations.mutate(clientId)}
              disabled={generateRecommendations.isPending}
              size="sm"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Générer nouvelles recommandations
            </Button>
          </div>

          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{rec.recommendation_type.replace('_', ' ')}</Badge>
                          <Badge variant={rec.priority >= 8 ? 'destructive' : rec.priority >= 6 ? 'secondary' : 'outline'}>
                            Priorité {rec.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-2">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Impact: <Badge variant="outline" className="text-xs">{rec.estimated_impact}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Effort: <Badge variant="outline" className="text-xs">{rec.implementation_effort}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => implementRecommendation.mutate(rec.id)}
                        disabled={implementRecommendation.isPending}
                      >
                        Implémenter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune recommandation active</h3>
                <p className="text-muted-foreground mb-4">
                  Générez des recommandations personnalisées basées sur les métriques actuelles.
                </p>
                <Button onClick={() => generateRecommendations.mutate(clientId)}>
                  Générer des recommandations
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
