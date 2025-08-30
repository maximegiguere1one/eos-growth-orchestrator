import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Video, Target, Users, Calendar } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">ONE OS</h1>
              <p className="text-muted-foreground">Operating System - Agence de Croissance</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-success text-success-foreground">
                Système Opérationnel
              </Badge>
              <Button className="bg-gradient-to-r from-primary to-primary/80">
                Rapport Hebdo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cockpit Overview */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">📊 Vue Cockpit</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-success">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Clients Actifs</CardTitle>
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
                <CardTitle className="text-sm text-muted-foreground">Vidéos en Production</CardTitle>
                <div className="text-2xl font-bold text-foreground">87/144</div>
              </CardHeader>
              <CardContent>
                <Progress value={60} className="mb-2" />
                <div className="text-sm text-warning">3 en retard</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-info">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Budget Ads Actuel</CardTitle>
                <div className="text-2xl font-bold text-foreground">$42,500</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-info">ROAS moyen: 3.2x</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Alertes Actives</CardTitle>
                <div className="text-2xl font-bold text-foreground">5</div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Action requise
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sections principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gestion Clients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
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
                <Video className="h-5 w-5 text-primary" />
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
                    <span className="ml-2 font-semibold text-success">87</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestion Ads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Performance Ads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <div className="text-xl font-bold text-success">$1.20</div>
                  <div className="text-xs text-muted-foreground">CPC Moyen</div>
                </div>
                <div className="text-center p-3 bg-warning/10 rounded-lg">
                  <div className="text-xl font-bold text-warning">$4.50</div>
                  <div className="text-xs text-muted-foreground">CPL Moyen</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h5 className="font-semibold mb-2">Alertes Automatiques</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    TechnoMax: CPC +35%
                  </div>
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
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
                <Calendar className="h-5 w-5 text-primary" />
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

        {/* Recommandations */}
        <Card className="mt-8 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-primary">👉 Recommandations Prioritaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>• <strong>TechnoMax:</strong> Prioriser tournage cette semaine, quota vidéo critique</div>
              <div>• <strong>Ads:</strong> Investiguer hausse CPC TechnoMax, tester nouvelles créas</div>
              <div>• <strong>Élite Protection:</strong> Maintenir momentum, augmenter budget créa gagnante</div>
              <div>• <strong>Équipe:</strong> Planifier formation montage pour réduire goulot</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;