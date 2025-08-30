
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { useEOSRocks, useCreateRock, useUpdateRock } from "@/hooks/useEOS";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";

export default function EOSRocks() {
  const { data: rocks = [], isLoading } = useEOSRocks();
  const createRock = useCreateRock();
  const updateRock = useUpdateRock();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRock, setNewRock] = useState({
    title: '',
    description: '',
    owner_id: '',
    start_date: '',
    due_date: '',
    progress: 0,
    status: 'not_started' as const
  });

  const handleCreateRock = () => {
    createRock.mutate(newRock, {
      onSuccess: () => {
        setNewRock({
          title: '',
          description: '',
          owner_id: '',
          start_date: '',
          due_date: '',
          progress: 0,
          status: 'not_started'
        });
        setIsCreateOpen(false);
      }
    });
  };

  const handleUpdateProgress = (rockId: string, progress: number, status?: string) => {
    const updates: any = { id: rockId, progress };
    
    if (status) {
      updates.status = status;
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.progress = 100;
      }
    } else {
      // Auto-update status based on progress
      if (progress === 100) {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      } else if (progress > 0) {
        updates.status = 'on_track';
      }
    }
    
    updateRock.mutate(updates);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'on_track': return 'secondary';
      case 'at_risk': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété';
      case 'on_track': return 'En cours';
      case 'at_risk': return 'À risque';
      default: return 'Non démarré';
    }
  };

  const calculateQuarterProgress = () => {
    if (rocks.length === 0) return 0;
    const totalProgress = rocks.reduce((sum, rock) => sum + rock.progress, 0);
    return Math.round(totalProgress / rocks.length);
  };

  const isQuarterMidway = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    // Simple quarter detection - can be improved
    return currentMonth % 3 === 1; // Middle month of quarter
  };

  if (isLoading) {
    return (
      <Section>
        <PageHeader title="Rocks EOS" subtitle="Chargement..." />
      </Section>
    );
  }

  return (
    <Section>
      <PageHeader 
        title="🎯 Rocks EOS"
        subtitle="Objectifs trimestriels - Les pierres angulaires de votre croissance"
        action={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Rock
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouveau Rock</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du Rock</Label>
                  <Input
                    id="title"
                    value={newRock.title}
                    onChange={(e) => setNewRock(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Implémenter CRM unifié"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    value={newRock.description}
                    onChange={(e) => setNewRock(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Détaillez l'objectif et les critères de réussite"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="owner">Propriétaire</Label>
                  <Input
                    id="owner"
                    value={newRock.owner_id}
                    onChange={(e) => setNewRock(prev => ({ ...prev, owner_id: e.target.value }))}
                    placeholder="Nom de la personne responsable"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Date de début</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newRock.start_date}
                      onChange={(e) => setNewRock(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Échéance</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newRock.due_date}
                      onChange={(e) => setNewRock(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateRock} disabled={!newRock.title || createRock.isPending}>
                    {createRock.isPending ? 'Création...' : 'Créer le Rock'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Quarter Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Vue d'ensemble du trimestre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{rocks.length}</div>
              <div className="text-sm text-muted-foreground">Rocks Actifs</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">{rocks.filter(r => r.status === 'completed').length}</div>
              <div className="text-sm text-muted-foreground">Complétés</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">{rocks.filter(r => r.status === 'at_risk').length}</div>
              <div className="text-sm text-muted-foreground">À Risque</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{calculateQuarterProgress()}%</div>
              <div className="text-sm text-muted-foreground">Progression Globale</div>
            </div>
          </div>

          {/* Quarter progress alert */}
          {isQuarterMidway() && calculateQuarterProgress() < 50 && rocks.length > 0 && (
            <div className="mt-4 p-4 border border-warning bg-warning/5 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span className="font-semibold text-warning">Alerte mi-trimestre</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Vous êtes à mi-parcours du trimestre avec seulement {calculateQuarterProgress()}% de progression globale. 
                Considérez revoir vos priorités ou ajuster vos objectifs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {rocks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Target}
              title="Aucun Rock défini"
              description="Créez vos premiers objectifs trimestriels. Un Rock doit être un objectif spécifique, mesurable et atteignable en 90 jours maximum."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rocks
            .sort((a, b) => {
              // Sort by status priority, then by due date
              const statusOrder = { 'at_risk': 0, 'on_track': 1, 'not_started': 2, 'completed': 3 };
              return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
            })
            .map((rock) => (
              <Card key={rock.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{rock.title}</h3>
                        <Badge 
                          variant={getStatusColor(rock.status)}
                          className={rock.status === 'completed' ? 'bg-success text-success-foreground' : ''}
                        >
                          {getStatusLabel(rock.status)}
                        </Badge>
                      </div>
                      
                      {rock.description && (
                        <p className="text-sm text-muted-foreground mb-3">{rock.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Propriétaire: </span>
                          <span className="font-medium">{rock.owner_id || 'Non assigné'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Début: </span>
                          <span className="font-medium">
                            {rock.start_date ? new Date(rock.start_date).toLocaleDateString() : 'Non défini'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Échéance: </span>
                          <span className="font-medium">
                            {rock.due_date ? new Date(rock.due_date).toLocaleDateString() : 'Non définie'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {rock.status !== 'completed' && (
                        <>
                          <Select 
                            value={rock.status} 
                            onValueChange={(status) => handleUpdateProgress(rock.id, rock.progress, status)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">Non démarré</SelectItem>
                              <SelectItem value="on_track">En cours</SelectItem>
                              <SelectItem value="at_risk">À risque</SelectItem>
                              <SelectItem value="completed">Complété</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateProgress(rock.id, 100, 'completed')}
                            disabled={updateRock.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Terminer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <div className="flex gap-2">
                        <span>{rock.progress}%</span>
                        {rock.status !== 'completed' && (
                          <Select 
                            value={rock.progress.toString()} 
                            onValueChange={(progress) => handleUpdateProgress(rock.id, parseInt(progress))}
                          >
                            <SelectTrigger className="w-20 h-6">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 21 }, (_, i) => i * 5).map((value) => (
                                <SelectItem key={value} value={value.toString()}>
                                  {value}%
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    <Progress value={rock.progress} className="h-2" />
                  </div>
                  
                  {rock.completed_at && (
                    <div className="mt-3 text-sm text-success">
                      ✅ Complété le {new Date(rock.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </Section>
  );
}
