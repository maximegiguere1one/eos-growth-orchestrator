
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Building2, Target, Users, BarChart3, CheckSquare, Calendar, Plus, AlertTriangle } from "lucide-react";
import { useEOSIssues, useEOSRocks, useEOSKPIs } from "@/hooks/useEOS";
import { EmptyState } from "@/components/common/EmptyState";
import { useNavigate } from "react-router-dom";
import { useMemo, memo, useCallback } from "react";
import { OptimizedEOSCard } from "@/components/eos/OptimizedEOSCard";
import { OptimizedRockCard } from "@/components/eos/OptimizedRockCard";
import { OptimizedIssueCard } from "@/components/eos/OptimizedIssueCard";

const EOS = memo(function EOS() {
  const navigate = useNavigate();
  const { data: issues = [], isLoading: issuesLoading } = useEOSIssues();
  const { data: rocks = [], isLoading: rocksLoading } = useEOSRocks();
  const { data: kpis = [], isLoading: kpisLoading } = useEOSKPIs();

  // Memoized navigation callbacks to prevent unnecessary re-renders
  const navigateToEOS = useCallback(() => navigate('/eos'), [navigate]);
  const navigateToScorecard = useCallback(() => navigate('/eos/scorecard'), [navigate]);
  const navigateToIssues = useCallback(() => navigate('/eos/issues'), [navigate]);
  const navigateToRocks = useCallback(() => navigate('/eos/rocks'), [navigate]);
  const navigateToMeetings = useCallback(() => navigate('/eos/meetings'), [navigate]);

  // Calculate EOS component status based on real data
  const eosOverview = useMemo(() => {
    const activeIssues = issues.filter(issue => issue.status === 'open');
    const completedRocks = rocks.filter(rock => rock.status === 'completed');
    const activeKPIs = kpis.length;

    return [
      {
        title: "Vision/Traction Organizer",
        status: "Jour",
        progress: 100,
        description: "Vision 10 ans, 3 ans et 1 an définie",
        action: navigateToEOS
      },
      {
        title: "People (Organigramme)", 
        status: "En cours",
        progress: 85,
        description: "Structure équipe et responsabilités",
        action: navigateToEOS
      },
      {
        title: "Data (Scorecard)",
        status: activeKPIs > 0 ? "Jour" : "À configurer",
        progress: activeKPIs > 0 ? 95 : 0,
        description: `${activeKPIs} KPI${activeKPIs > 1 ? 's' : ''} configuré${activeKPIs > 1 ? 's' : ''}`,
        action: navigateToScorecard
      },
      {
        title: "Issues (Problèmes)",
        status: activeIssues.length > 7 ? "Attention" : activeIssues.length > 0 ? "En cours" : "Jour",
        progress: activeIssues.length === 0 ? 100 : Math.max(0, 100 - (activeIssues.length * 10)),
        description: `${activeIssues.length} issue${activeIssues.length > 1 ? 's' : ''} active${activeIssues.length > 1 ? 's' : ''}`,
        action: navigateToIssues
      },
      {
        title: "Process (SOP)",
        status: "En cours",
        progress: 75,
        description: "Processus documentés et suivis",
        action: navigateToEOS
      },
      {
        title: "Traction (Rocks)",
        status: rocks.length > 0 ? "En cours" : "À configurer",
        progress: rocks.length > 0 ? Math.round((completedRocks.length / rocks.length) * 100) : 0,
        description: `${completedRocks.length}/${rocks.length} rocks complétés`,
        action: navigateToRocks
      }
    ];
  }, [issues, rocks, kpis, navigateToEOS, navigateToScorecard, navigateToIssues, navigateToRocks]);

  if (issuesLoading || rocksLoading || kpisLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">EOS Model Dashboard</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">EOS Model Dashboard</h1>
          <p className="text-muted-foreground">Entrepreneurial Operating System - Vue d'ensemble</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-success text-success-foreground text-lg px-4 py-2">
            EOS Implementé
          </Badge>
          <Button onClick={navigateToMeetings} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Level 10 Meeting
            </Button>
        </div>
      </div>

      {/* EOS Components Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eosOverview.map((component, index) => (
          <OptimizedEOSCard
            key={component.title}
            title={component.title}
            status={component.status}
            progress={component.progress}
            description={component.description}
            onClick={component.action}
          />
        ))}
      </div>

      {/* Current Quarter Rocks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Rocks Actifs (Objectifs Trimestriels)
            </CardTitle>
            <Button onClick={navigateToRocks} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Gérer les Rocks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rocks.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Aucun Rock défini"
              description="Créez vos premiers objectifs trimestriels pour commencer à utiliser le système EOS."
              action={{
                label: "Créer un Rock",
                onClick: navigateToRocks
              }}
            />
          ) : (
            <div className="space-y-4">
              {rocks.slice(0, 5).map((rock) => (
                <OptimizedRockCard key={rock.id} rock={rock} />
              ))}
              
              {rocks.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={navigateToRocks}>
                    Voir tous les rocks ({rocks.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & Level 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Level 10 Meeting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h5 className="font-semibold">Prochaine réunion</h5>
              <p className="text-sm text-muted-foreground">Lundi 9h00 - Salle de conférence</p>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-semibold">Agenda EOS Standard</h5>
              <div className="text-sm space-y-1">
                <div>✓ Segue (5 min)</div>
                <div>✓ Scorecard Review (5 min)</div>
                <div>✓ Rock Review (5 min)</div>
                <div>✓ Customer/Employee Headlines (5 min)</div>
                <div>• To-do List (5 min)</div>
                <div>• IDS (Issues-Identify-Discuss-Solve) (60 min)</div>
                <div>• Conclude (5 min)</div>
              </div>
            </div>

            <Button onClick={navigateToMeetings} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Gérer les Meetings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Issues Prioritaires
              </CardTitle>
              <Button onClick={navigateToIssues} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Gérer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="Aucune issue active"
                description="Aucun problème en cours. Parfait !"
                action={{
                  label: "Voir toutes les issues",
                  onClick: navigateToIssues
                }}
              />
            ) : (
              <div className="space-y-3">
                {issues.slice(0, 3).map((issue) => (
                  <OptimizedIssueCard key={issue.id} issue={issue} />
                ))}
                
                {issues.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm" onClick={navigateToIssues}>
                      Voir toutes les issues ({issues.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scorecard Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Scorecard Hebdomadaire
            </CardTitle>
            <Button onClick={navigateToScorecard} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Configurer KPIs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {kpis.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="Scorecard non configuré"
              description="Configurez vos KPIs pour suivre les métriques hebdomadaires de votre entreprise."
              action={{
                label: "Configurer le Scorecard",
                onClick: navigateToScorecard
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {kpis.slice(0, 4).map((kpi) => (
                <div key={kpi.id} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {kpi.target || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">{kpi.name}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default EOS;
