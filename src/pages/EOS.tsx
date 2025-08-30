
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Building2, Target, Users, BarChart3, CheckSquare, Calendar, Plus, AlertTriangle } from "lucide-react";
import { useEOSIssues, useEOSRocks, useEOSKPIs } from "@/hooks/useEOS";
import { EmptyState } from "@/components/common/EmptyState";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const EOS = () => {
  const navigate = useNavigate();
  const { data: issues = [], isLoading: issuesLoading } = useEOSIssues();
  const { data: rocks = [], isLoading: rocksLoading } = useEOSRocks();
  const { data: kpis = [], isLoading: kpisLoading } = useEOSKPIs();

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
        action: () => navigate('/eos')
      },
      {
        title: "People (Organigramme)", 
        status: "En cours",
        progress: 85,
        description: "Structure équipe et responsabilités",
        action: () => navigate('/eos')
      },
      {
        title: "Data (Scorecard)",
        status: activeKPIs > 0 ? "Jour" : "À configurer",
        progress: activeKPIs > 0 ? 95 : 0,
        description: `${activeKPIs} KPI${activeKPIs > 1 ? 's' : ''} configuré${activeKPIs > 1 ? 's' : ''}`,
        action: () => navigate('/eos/scorecard')
      },
      {
        title: "Issues (Problèmes)",
        status: activeIssues.length > 7 ? "Attention" : activeIssues.length > 0 ? "En cours" : "Jour",
        progress: activeIssues.length === 0 ? 100 : Math.max(0, 100 - (activeIssues.length * 10)),
        description: `${activeIssues.length} issue${activeIssues.length > 1 ? 's' : ''} active${activeIssues.length > 1 ? 's' : ''}`,
        action: () => navigate('/eos/issues')
      },
      {
        title: "Process (SOP)",
        status: "En cours",
        progress: 75,
        description: "Processus documentés et suivis",
        action: () => navigate('/eos')
      },
      {
        title: "Traction (Rocks)",
        status: rocks.length > 0 ? "En cours" : "À configurer",
        progress: rocks.length > 0 ? Math.round((completedRocks.length / rocks.length) * 100) : 0,
        description: `${completedRocks.length}/${rocks.length} rocks complétés`,
        action: () => navigate('/eos/rocks')
      }
    ];
  }, [issues, rocks, kpis, navigate]);

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
          <Button onClick={() => navigate('/eos/meetings')} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Level 10 Meeting
          </Button>
        </div>
      </div>

      {/* EOS Components Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eosOverview.map((component, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={component.action}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{component.title}</CardTitle>
                <Badge 
                  variant={
                    component.status === "Jour" ? "default" : 
                    component.status === "Attention" ? "destructive" : "secondary"
                  }
                  className={component.status === "Jour" ? "bg-success text-success-foreground" : ""}
                >
                  {component.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progression</span>
                  <span>{component.progress}%</span>
                </div>
                <Progress value={component.progress} />
              </div>
              <p className="text-sm text-muted-foreground">{component.description}</p>
            </CardContent>
          </Card>
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
            <Button onClick={() => navigate('/eos/rocks')} variant="outline" size="sm">
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
                onClick: () => navigate('/eos/rocks')
              }}
            />
          ) : (
            <div className="space-y-4">
              {rocks.slice(0, 5).map((rock) => (
                <div key={rock.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{rock.title}</h4>
                    <Badge 
                      variant={
                        rock.status === "completed" ? "default" :
                        rock.status === "at_risk" ? "destructive" : "secondary"
                      }
                      className={rock.status === "completed" ? "bg-success text-success-foreground" : ""}
                    >
                      {rock.status === "completed" ? "Complété" :
                       rock.status === "at_risk" ? "À risque" :
                       rock.status === "on_track" ? "En cours" : "Non démarré"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Propriétaire: </span>
                      <span className="font-medium">{rock.owner_id || 'Non assigné'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Échéance: </span>
                      <span className="font-medium">{rock.due_date || 'Non définie'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Progression: </span>
                      <span className="font-medium">{rock.progress}%</span>
                    </div>
                  </div>
                  
                  <Progress value={rock.progress} />
                </div>
              ))}
              
              {rocks.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => navigate('/eos/rocks')}>
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

            <Button onClick={() => navigate('/eos/meetings')} className="w-full">
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
              <Button onClick={() => navigate('/eos/issues')} variant="outline" size="sm">
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
                  onClick: () => navigate('/eos/issues')
                }}
              />
            ) : (
              <div className="space-y-3">
                {issues.slice(0, 3).map((issue) => (
                  <div key={issue.id} className={`border-l-4 p-3 ${
                    issue.priority >= 8 ? 'border-l-destructive bg-destructive/5' :
                    issue.priority >= 5 ? 'border-l-warning bg-warning/5' :
                    'border-l-info bg-info/5'
                  }`}>
                    <h5 className={`font-semibold ${
                      issue.priority >= 8 ? 'text-destructive' :
                      issue.priority >= 5 ? 'text-warning' :
                      'text-info'
                    }`}>
                      {issue.priority >= 8 ? 'Urgent' :
                       issue.priority >= 5 ? 'Important' :
                       'À planifier'}
                    </h5>
                    <p className="text-sm">{issue.title}</p>
                  </div>
                ))}
                
                {issues.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/eos/issues')}>
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
            <Button onClick={() => navigate('/eos/scorecard')} variant="outline" size="sm">
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
                onClick: () => navigate('/eos/scorecard')
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
};

export default EOS;
