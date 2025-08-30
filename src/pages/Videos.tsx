import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Video, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const videoStatuses = [
  { label: "Idée", color: "bg-muted", count: 15 },
  { label: "Script", color: "bg-info", count: 23 },
  { label: "Tournage", color: "bg-warning", count: 8 },
  { label: "Montage", color: "bg-primary", count: 12 },
  { label: "Publié", color: "bg-success", count: 87 }
];

const recentVideos = [
  {
    id: 1,
    title: "Sécurité entreprise - Élite Protection",
    client: "Élite Protection",
    status: "Publié",
    phase: "Publié",
    dueDate: "2025-01-15",
    performance: { views: "12.5K", engagement: "8.2%" }
  },
  {
    id: 2,
    title: "Innovation technologique - TechnoMax",
    client: "TechnoMax",
    status: "Montage",
    phase: "En retard",
    dueDate: "2025-01-18",
    performance: null
  },
  {
    id: 3,
    title: "Menu spécial - Resto Plus",
    client: "Resto Plus",
    status: "Tournage",
    phase: "En cours",
    dueDate: "2025-01-20",
    performance: null
  }
];

const Videos = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production Vidéos</h1>
          <p className="text-muted-foreground">Suivi de la production vidéo (12 vidéos/mois/client)</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Vidéo
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Quota Mensuel</CardTitle>
            <div className="text-2xl font-bold text-foreground">87/144</div>
          </CardHeader>
          <CardContent>
            <Progress value={60} className="mb-2" />
            <div className="text-sm text-warning">3 en retard</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Publiées</CardTitle>
            <div className="text-2xl font-bold text-foreground">87</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-success">60% du quota</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">En Production</CardTitle>
            <div className="text-2xl font-bold text-foreground">43</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-warning">Scripts + Tournage + Montage</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">En Attente</CardTitle>
            <div className="text-2xl font-bold text-foreground">14</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-info">À planifier</div>
          </CardContent>
        </Card>
      </div>

      {/* Production Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Pipeline de Production
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {videoStatuses.map((status, index) => (
              <div key={index} className="text-center p-4 rounded-lg border">
                <div className={`w-8 h-8 rounded-full ${status.color} mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                  {status.count}
                </div>
                <div className="font-semibold">{status.label}</div>
                <div className="text-sm text-muted-foreground">
                  {status.count} vidéos
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Videos */}
      <Card>
        <CardHeader>
          <CardTitle>Vidéos Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentVideos.map((video) => (
              <div key={video.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{video.title}</h4>
                    <p className="text-sm text-muted-foreground">{video.client}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={video.phase === "En retard" ? "destructive" : video.phase === "Publié" ? "default" : "secondary"}>
                      {video.status}
                    </Badge>
                    {video.phase === "En retard" && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Échéance: {video.dueDate}</span>
                  </div>
                  
                  {video.performance && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Vues:</span>
                        <span className="font-medium">{video.performance.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="font-medium text-success">{video.performance.engagement}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quota par Client */}
      <Card>
        <CardHeader>
          <CardTitle>Quota par Client (12/mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Élite Protection</span>
              <div className="flex items-center gap-4 w-1/2">
                <Progress value={58} className="flex-1" />
                <span className="text-sm font-medium">7/12</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>TechnoMax</span>
              <div className="flex items-center gap-4 w-1/2">
                <Progress value={33} className="flex-1" />
                <span className="text-sm font-medium text-destructive">4/12</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Resto Plus</span>
              <div className="flex items-center gap-4 w-1/2">
                <Progress value={75} className="flex-1" />
                <span className="text-sm font-medium">9/12</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Videos;