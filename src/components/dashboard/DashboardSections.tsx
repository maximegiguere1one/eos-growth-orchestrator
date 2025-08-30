
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Users, Video, Target, Calendar, Plus } from "lucide-react";
import { useEOSIssues, useEOSRocks, useEOSKPIs } from "@/hooks/useEOS";
import { EmptyState } from "@/components/common/EmptyState";
import { useNavigate } from "react-router-dom";

export function DashboardSections() {
  const navigate = useNavigate();
  const { data: issues = [] } = useEOSIssues();
  const { data: rocks = [] } = useEOSRocks();
  const { data: kpis = [] } = useEOSKPIs();

  const activeIssues = issues.filter(issue => issue.status === 'open');
  const completedRocks = rocks.filter(rock => rock.status === 'completed');

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
        <CardContent>
          <EmptyState
            icon={Users}
            title="Aucun client configuré"
            description="Connectez vos données clients pour voir les statistiques en temps réel."
            action={
              <Button onClick={() => navigate('/clients')} variant="outline">
                Configurer les clients
              </Button>
            }
          />
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
        <CardContent>
          <EmptyState
            icon={Video}
            title="Production non configurée"
            description="Configurez vos workflows de production vidéo."
            action={
              <Button onClick={() => navigate('/videos')} variant="outline">
                Configurer la production
              </Button>
            }
          />
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
        <CardContent>
          <EmptyState
            icon={Target}
            title="Publicités non configurées"
            description="Connectez vos comptes publicitaires pour suivre les performances."
            action={
              <Button onClick={() => navigate('/ads')} variant="outline">
                Configurer les ads
              </Button>
            }
          />
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
              <span className="text-sm">Issues Actives</span>
              <Badge variant={activeIssues.length > 0 ? "destructive" : "default"}>
                {activeIssues.length}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Rocks Complétés</span>
              <span className="text-sm font-semibold">
                {completedRocks.length}/{rocks.length}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">KPIs Configurés</span>
              <span className="text-sm font-semibold">{kpis.length}</span>
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <Button onClick={() => navigate('/eos')} className="w-full" size="sm">
                <Building2 className="h-4 w-4 mr-2" />
                Voir le Dashboard EOS
              </Button>
              
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => navigate('/eos/issues')} variant="outline" size="sm">
                  Issues
                </Button>
                <Button onClick={() => navigate('/eos/rocks')} variant="outline" size="sm">
                  Rocks
                </Button>
                <Button onClick={() => navigate('/eos/scorecard')} variant="outline" size="sm">
                  KPIs
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
