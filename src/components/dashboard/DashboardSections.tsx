import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Users, Video, Target, Calendar } from "lucide-react";

export function DashboardSections() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gestion Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Gestion Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Élite Protection</h4>
              <Badge className="bg-success text-success-foreground">En cours</Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📈 Reach: +20% cette semaine</p>
              <p>🎥 Vidéos: 7/12 publiées</p>
              <p>💰 ROAS: 3.2x</p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">TechnoMax</h4>
              <Badge variant="destructive">Attention</Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>⚠️ CPC +35% vs semaine passée</p>
              <p>🎥 Vidéos: 4/12 publiées</p>
              <p>💰 ROAS: 2.1x</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion Vidéos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-muted-foreground" />
            Production Vidéos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Quota mensuel global</span>
              <span className="font-semibold">87/144</span>
            </div>
            <Progress value={60} />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Scripts prêts:</span>
                <span className="ml-2 font-semibold">23</span>
              </div>
              <div>
                <span className="text-muted-foreground">En montage:</span>
                <span className="ml-2 font-semibold">12</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tournage:</span>
                <span className="ml-2 font-semibold">8</span>
              </div>
              <div>
                <span className="text-muted-foreground">Publiées:</span>
                <span className="ml-2 font-semibold text-foreground">87</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion Ads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            Performance Ads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border border-success/20 rounded-lg">
              <div className="text-xl font-bold text-foreground">$1.20</div>
              <div className="text-xs text-muted-foreground">CPC Moyen</div>
            </div>
            <div className="text-center p-3 border border-warning/20 rounded-lg">
              <div className="text-xl font-bold text-foreground">$4.50</div>
              <div className="text-xs text-muted-foreground">CPL Moyen</div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h5 className="font-semibold mb-2">Alertes Automatiques</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                TechnoMax: CPC +35%
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Budget Resto Plus: 90% dépensé
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EOS Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            EOS Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Vision/Traction Organizer</span>
              <Badge className="bg-success text-success-foreground">Jour</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Rocks Q3 Progress</span>
              <span className="text-sm font-semibold">3/5 ✅</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Level 10 Meetings</span>
              <span className="text-sm text-muted-foreground">Lun 9h00</span>
            </div>
            
            <div className="border-t pt-3">
              <h5 className="font-semibold mb-2 text-sm">Issues à Résoudre</h5>
              <div className="space-y-1 text-xs">
                <div>• Retard livraison créa Élite Protection</div>
                <div>• Quota vidéo TechnoMax menacé</div>
                <div>• Formation équipe montage</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}