import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Users, TrendingUp, AlertTriangle } from "lucide-react";

const clients = [
  {
    id: 1,
    name: "Élite Protection",
    industry: "Sécurité",
    status: "En cours",
    videos: { completed: 7, total: 12 },
    reach: "+20%",
    roas: "3.2x",
    alerts: [],
    responsible: "Marie Dubois"
  },
  {
    id: 2,
    name: "TechnoMax",
    industry: "Technologie",
    status: "Attention",
    videos: { completed: 4, total: 12 },
    reach: "-5%",
    roas: "2.1x",
    alerts: ["CPC +35%", "Quota vidéo critique"],
    responsible: "Jean Martin"
  },
  {
    id: 3,
    name: "Resto Plus",
    industry: "Restauration",
    status: "En cours",
    videos: { completed: 9, total: 12 },
    reach: "+12%",
    roas: "2.8x",
    alerts: ["Budget 90% dépensé"],
    responsible: "Sarah Johnson"
  }
];

const Clients = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion Clients</h1>
          <p className="text-muted-foreground">Suivi complet de tous les clients actifs</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Client
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Clients</CardTitle>
            <div className="text-2xl font-bold text-foreground">12</div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2 ce mois
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">En Attention</CardTitle>
            <div className="text-2xl font-bold text-foreground">3</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-warning">Nécessite action</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">ROAS Moyen</CardTitle>
            <div className="text-2xl font-bold text-foreground">2.8x</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-info">Tous clients confondus</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Quota Vidéos</CardTitle>
            <div className="text-2xl font-bold text-foreground">69%</div>
          </CardHeader>
          <CardContent>
            <Progress value={69} />
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {client.name}
                </CardTitle>
                <Badge 
                  variant={client.status === "En cours" ? "default" : "destructive"}
                  className={client.status === "En cours" ? "bg-success text-success-foreground" : ""}
                >
                  {client.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{client.industry}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{client.videos.completed}/{client.videos.total}</div>
                  <div className="text-muted-foreground">Vidéos</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${client.reach.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                    {client.reach}
                  </div>
                  <div className="text-muted-foreground">Reach</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{client.roas}</div>
                  <div className="text-muted-foreground">ROAS</div>
                </div>
              </div>

              {/* Video Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Quota Vidéos</span>
                  <span>{Math.round((client.videos.completed / client.videos.total) * 100)}%</span>
                </div>
                <Progress value={(client.videos.completed / client.videos.total) * 100} />
              </div>

              {/* Alerts */}
              {client.alerts.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">Alertes</h5>
                  {client.alerts.map((alert, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      {alert}
                    </div>
                  ))}
                </div>
              )}

              {/* Responsible */}
              <div className="pt-2 border-t">
                <div className="text-sm">
                  <span className="text-muted-foreground">Responsable: </span>
                  <span className="font-medium">{client.responsible}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Clients;