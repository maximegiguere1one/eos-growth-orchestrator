import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const adsMetrics = [
  {
    title: "Budget Total Actuel",
    value: "$42,500",
    change: "+8% vs semaine passée",
    trend: "up",
    color: "primary"
  },
  {
    title: "CPC Moyen",
    value: "$1.20",
    change: "+15% vs semaine passée",
    trend: "up",
    color: "warning"
  },
  {
    title: "CPL Moyen",
    value: "$4.50",
    change: "-5% vs semaine passée",
    trend: "down",
    color: "success"
  },
  {
    title: "ROAS Moyen",
    value: "3.2x",
    change: "Stable",
    trend: "stable",
    color: "info"
  }
];

const campaigns = [
  {
    id: 1,
    client: "Élite Protection",
    campaign: "Sécurité Entreprise Q1",
    budget: "$8,500",
    spent: "$6,200",
    cpc: "$1.10",
    cpl: "$3.80",
    roas: "3.6x",
    status: "Actif",
    alerts: []
  },
  {
    id: 2,
    client: "TechnoMax",
    campaign: "Innovation Tech",
    budget: "$12,000",
    spent: "$9,800",
    cpc: "$1.65",
    cpl: "$6.20",
    roas: "2.1x",
    status: "Attention",
    alerts: ["CPC +35%", "ROAS en baisse"]
  },
  {
    id: 3,
    client: "Resto Plus",
    campaign: "Menu Spécial",
    budget: "$5,500",
    spent: "$4,950",
    cpc: "$0.95",
    cpl: "$3.20",
    roas: "4.2x",
    status: "Optimal",
    alerts: ["Budget 90% dépensé"]
  }
];

const Ads = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion Publicités</h1>
          <p className="text-muted-foreground">Suivi et optimisation des campagnes publicitaires</p>
        </div>
        <Button variant="premium">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {adsMetrics.map((metric, index) => (
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
            Campagnes Actives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{campaign.campaign}</h4>
                    <p className="text-muted-foreground">{campaign.client}</p>
                  </div>
                  <Badge 
                    variant={
                      campaign.status === "Optimal" ? "default" : 
                      campaign.status === "Attention" ? "destructive" : "secondary"
                    }
                    className={
                      campaign.status === "Optimal" ? "bg-success text-success-foreground" : ""
                    }
                  >
                    {campaign.status}
                  </Badge>
                </div>

                {/* Budget Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget utilisé</span>
                    <span>{campaign.spent} / {campaign.budget}</span>
                  </div>
                  <Progress 
                    value={(parseFloat(campaign.spent.replace('$', '').replace(',', '')) / 
                           parseFloat(campaign.budget.replace('$', '').replace(',', ''))) * 100} 
                  />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold">{campaign.cpc}</div>
                    <div className="text-xs text-muted-foreground">CPC</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold">{campaign.cpl}</div>
                    <div className="text-xs text-muted-foreground">CPL</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-success">{campaign.roas}</div>
                    <div className="text-xs text-muted-foreground">ROAS</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold">
                      {Math.round((parseFloat(campaign.spent.replace('$', '').replace(',', '')) / parseFloat(campaign.budget.replace('$', '').replace(',', ''))) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Budget</div>
                  </div>
                </div>

                {/* Alerts */}
                {campaign.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm">Alertes Automatiques</h5>
                    {campaign.alerts.map((alert, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {alert}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analyse de Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-l-success p-4 bg-success/5">
              <h5 className="font-semibold text-success">Performances Excellentes</h5>
              <p className="text-sm text-muted-foreground">Resto Plus - ROAS 4.2x, CPC optimal</p>
            </div>
            <div className="border-l-4 border-l-warning p-4 bg-warning/5">
              <h5 className="font-semibold text-warning">À Surveiller</h5>
              <p className="text-sm text-muted-foreground">Élite Protection - Budget bientôt épuisé</p>
            </div>
            <div className="border-l-4 border-l-destructive p-4 bg-destructive/5">
              <h5 className="font-semibold text-destructive">Action Requise</h5>
              <p className="text-sm text-muted-foreground">TechnoMax - CPC élevé, ROAS en baisse</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommandations Auto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div>• <strong>TechnoMax:</strong> Tester nouvelles créas, réduire enchères</div>
              <div>• <strong>Resto Plus:</strong> Augmenter budget pour maintenir performance</div>
              <div>• <strong>Élite Protection:</strong> Optimiser audiences similaires</div>
              <div>• <strong>Global:</strong> Redistribuer budget vers campagnes ROAS &gt; 3x</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ads;