import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Target, Users, BarChart3, CheckSquare, Calendar } from "lucide-react";

const eosOverview = [
  {
    title: "Vision/Traction Organizer",
    status: "Jour",
    progress: 100,
    description: "Vision 10 ans, 3 ans et 1 an définie"
  },
  {
    title: "People (Organigramme)",
    status: "En cours",
    progress: 85,
    description: "Structure équipe et responsabilités"
  },
  {
    title: "Data (Scorecard)",
    status: "Jour",
    progress: 95,
    description: "Métriques hebdomadaires trackées"
  },
  {
    title: "Issues (Problèmes)",
    status: "Attention",
    progress: 60,
    description: "7 issues actives à résoudre"
  },
  {
    title: "Process (SOP)",
    status: "En cours",
    progress: 75,
    description: "Processus documentés et suivis"
  },
  {
    title: "Traction (Rocks)",
    status: "En cours",
    progress: 60,
    description: "Rocks Q3: 3/5 en progression"
  }
];

const currentRocks = [
  {
    title: "Implémenter CRM unifié",
    owner: "Marie Dubois",
    deadline: "2025-03-31",
    progress: 85,
    status: "En cours"
  },
  {
    title: "Automatiser reporting client",
    owner: "Jean Martin",
    deadline: "2025-03-31",
    progress: 40,
    status: "En retard"
  },
  {
    title: "Former équipe montage",
    owner: "Sarah Johnson",
    deadline: "2025-03-15",
    progress: 70,
    status: "En cours"
  },
  {
    title: "Optimiser pipeline vidéo",
    owner: "Marc Tremblay",
    deadline: "2025-03-31",
    progress: 90,
    status: "Presque fini"
  },
  {
    title: "Développer offre premium",
    owner: "Maxime Giguère",
    deadline: "2025-03-31",
    progress: 25,
    status: "À risque"
  }
];

const EOS = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">EOS Model Dashboard</h1>
          <p className="text-muted-foreground">Entrepreneurial Operating System - Vue d'ensemble</p>
        </div>
        <Badge className="bg-success text-success-foreground text-lg px-4 py-2">
          EOS Implementé
        </Badge>
      </div>

      {/* EOS Components Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eosOverview.map((component, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
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
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Rocks Q1 2025 (Objectifs Trimestriels)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentRocks.map((rock, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{rock.title}</h4>
                  <Badge 
                    variant={
                      rock.status === "Presque fini" ? "default" :
                      rock.status === "En retard" || rock.status === "À risque" ? "destructive" : "secondary"
                    }
                    className={rock.status === "Presque fini" ? "bg-success text-success-foreground" : ""}
                  >
                    {rock.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Responsable: </span>
                    <span className="font-medium">{rock.owner}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Échéance: </span>
                    <span className="font-medium">{rock.deadline}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Progression: </span>
                    <span className="font-medium">{rock.progress}%</span>
                  </div>
                </div>
                
                <Progress value={rock.progress} />
              </div>
            ))}
          </div>
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
              <h5 className="font-semibold">Agenda</h5>
              <div className="text-sm space-y-1">
                <div>✓ Scorecard Review (5 min)</div>
                <div>✓ Rock Review (5 min)</div>
                <div>✓ Customer/Employee Headlines (5 min)</div>
                <div>• IDS (Issues-Identify-Discuss-Solve) (75 min)</div>
                <div>• Conclude (5 min)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Issues Prioritaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-4 border-l-destructive p-3 bg-destructive/5">
                <h5 className="font-semibold text-destructive">Urgent</h5>
                <p className="text-sm">Retard livraison créa Élite Protection</p>
              </div>
              <div className="border-l-4 border-l-warning p-3 bg-warning/5">
                <h5 className="font-semibold text-warning">Important</h5>
                <p className="text-sm">Quota vidéo TechnoMax menacé</p>
              </div>
              <div className="border-l-4 border-l-info p-3 bg-info/5">
                <h5 className="font-semibold text-info">À planifier</h5>
                <p className="text-sm">Formation équipe montage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scorecard Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Scorecard Hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">85%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Client</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">60%</div>
              <div className="text-sm text-muted-foreground">Quota Vidéos</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-info">3.2x</div>
              <div className="text-sm text-muted-foreground">ROAS Moyen</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">92%</div>
              <div className="text-sm text-muted-foreground">Tâches Complétées</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EOS;