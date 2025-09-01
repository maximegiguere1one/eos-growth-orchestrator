
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, AlertTriangle, Plus } from "lucide-react";
import { CreateCampaignDialog } from "@/components/ads/CreateCampaignDialog";
import { useAdsCampaigns, useCampaignMetrics, useGlobalAdsMetrics } from "@/hooks/useAds";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

const Ads = () => {
  const { data: campaigns, isLoading: campaignsLoading } = useAdsCampaigns();
  const { data: metrics } = useCampaignMetrics();
  const { data: globalMetrics } = useGlobalAdsMetrics();

  if (campaignsLoading) {
    return <LoadingSkeleton />;
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format decimal
  const formatDecimal = (value: number, decimals = 2) => {
    return value.toFixed(decimals);
  };

  // Get metrics for a campaign
  const getCampaignMetrics = (campaignId: string) => {
    return metrics?.find(m => m.campaign_id === campaignId);
  };

  // Get campaign status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'draft':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get campaign status in French
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'paused':
        return 'En pause';
      case 'completed':
        return 'Terminé';
      case 'draft':
        return 'Brouillon';
      default:
        return status;
    }
  };

  // Global metrics for the cards
  const globalMetricsCards = [
    {
      title: "Budget Total Actuel",
      value: formatCurrency(globalMetrics?.totalBudget || 0),
      change: "+0% vs semaine passée",
      trend: "stable",
      color: "primary"
    },
    {
      title: "CPC Moyen",
      value: `${formatDecimal(globalMetrics?.avgCpc || 0, 2)}€`,
      change: "+0% vs semaine passée",
      trend: "stable",
      color: "warning"
    },
    {
      title: "CPL Moyen",
      value: `${formatDecimal(globalMetrics?.avgCpl || 0, 2)}€`,
      change: "+0% vs semaine passée",
      trend: "stable",
      color: "success"
    },
    {
      title: "ROAS Moyen",
      value: `${formatDecimal(globalMetrics?.avgRoas || 0, 1)}x`,
      change: "Stable",
      trend: "stable",
      color: "info"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion Publicités</h1>
          <p className="text-muted-foreground">Suivi et optimisation des campagnes publicitaires</p>
        </div>
        <CreateCampaignDialog />
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {globalMetricsCards.map((metric, index) => (
          <Card key={index} className={`border-l-4 border-l-${metric.color}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">{metric.title}</CardTitle>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center text-sm ${
                metric.trend === 'up' ? 'text-warning' : 
                metric.trend === 'down' ? 'text-success' : 'text-muted-foreground'
              }`}>
                {metric.trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
                {metric.trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
                {metric.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Campagnes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!campaigns || campaigns.length === 0 ? (
            <EmptyState
              title="Aucune campagne"
              description="Commencez par créer votre première campagne publicitaire."
              action={
                <CreateCampaignDialog>
                  <Button variant="premium">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer ma première campagne
                  </Button>
                </CreateCampaignDialog>
              }
            />
          ) : (
            <div className="space-y-6">
              {campaigns.map((campaign) => {
                const campaignMetrics = getCampaignMetrics(campaign.id);
                const spentPercentage = campaign.budget_total > 0 
                  ? Math.min((campaignMetrics?.total_spend || 0) / campaign.budget_total * 100, 100)
                  : 0;

                return (
                  <div key={campaign.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{campaign.name}</h4>
                        <p className="text-muted-foreground">
                          {campaign.clients?.name || "Aucun client associé"}
                        </p>
                        {campaign.objective && (
                          <p className="text-sm text-muted-foreground mt-1">{campaign.objective}</p>
                        )}
                      </div>
                      <Badge variant={getStatusVariant(campaign.status)}>
                        {getStatusLabel(campaign.status)}
                      </Badge>
                    </div>

                    {/* Budget Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Budget utilisé</span>
                        <span>
                          {formatCurrency(campaignMetrics?.total_spend || 0)} / {formatCurrency(campaign.budget_total)}
                        </span>
                      </div>
                      <Progress value={spentPercentage} />
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">
                          {campaignMetrics?.cpc ? `${formatDecimal(campaignMetrics.cpc, 2)}€` : '--'}
                        </div>
                        <div className="text-xs text-muted-foreground">CPC</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">
                          {campaignMetrics?.cpl ? `${formatDecimal(campaignMetrics.cpl, 2)}€` : '--'}
                        </div>
                        <div className="text-xs text-muted-foreground">CPL</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-success">
                          {campaignMetrics?.roas ? `${formatDecimal(campaignMetrics.roas, 1)}x` : '--'}
                        </div>
                        <div className="text-xs text-muted-foreground">ROAS</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">
                          {Math.round(spentPercentage)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Budget</div>
                      </div>
                    </div>

                    {/* Alerts */}
                    {spentPercentage >= 90 && (
                      <div className="space-y-2">
                        <h5 className="font-semibold text-sm">Alertes Automatiques</h5>
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                          Budget {Math.round(spentPercentage)}% dépensé
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {campaigns && campaigns.length > 0 && (
        /* Performance Analysis */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse de Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaigns.map((campaign) => {
                const campaignMetrics = getCampaignMetrics(campaign.id);
                const roas = campaignMetrics?.roas || 0;
                const spentPercentage = campaign.budget_total > 0 
                  ? (campaignMetrics?.total_spend || 0) / campaign.budget_total * 100
                  : 0;

                let status = 'info';
                let message = 'Performance standard';
                
                if (roas > 3) {
                  status = 'success';
                  message = 'Excellente performance';
                } else if (spentPercentage > 80) {
                  status = 'warning';
                  message = 'Budget bientôt épuisé';
                } else if (roas < 1.5 && campaignMetrics?.total_spend > 100) {
                  status = 'destructive';
                  message = 'Performance faible';
                }

                return (
                  <div key={campaign.id} className={`border-l-4 border-l-${status} p-4 bg-${status}/5`}>
                    <h5 className={`font-semibold text-${status}`}>{message}</h5>
                    <p className="text-sm text-muted-foreground">
                      {campaign.name} - ROAS {formatDecimal(roas, 1)}x
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                {campaigns.length === 0 ? (
                  <div>• Créez votre première campagne pour commencer</div>
                ) : (
                  <>
                    <div>• Surveillez les campagnes avec un ROAS &lt; 2x</div>
                    <div>• Augmentez le budget des campagnes performantes (ROAS &gt; 3x)</div>
                    <div>• Testez de nouvelles audiences pour améliorer les performances</div>
                    <div>• Optimisez les créas des campagnes avec CPC élevé</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Ads;
