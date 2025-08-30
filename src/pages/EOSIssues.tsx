
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckSquare, Plus, Archive, AlertTriangle, Check } from "lucide-react";
import { useEOSIssues, useCreateIssue, useUpdateIssue } from "@/hooks/useEOS";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";

export default function EOSIssues() {
  const { data: issues = [], isLoading } = useEOSIssues();
  const createIssue = useCreateIssue();
  const updateIssue = useUpdateIssue();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 5,
    assigned_to: '',
    status: 'open' as const
  });

  const handleCreateIssue = () => {
    createIssue.mutate(newIssue, {
      onSuccess: () => {
        setNewIssue({ title: '', description: '', priority: 5, assigned_to: '', status: 'open' });
        setIsCreateOpen(false);
      }
    });
  };

  const handleResolveIssue = (issueId: string) => {
    updateIssue.mutate({
      id: issueId,
      status: 'resolved',
      resolved_at: new Date().toISOString()
    });
  };

  const handleArchiveIssue = (issueId: string) => {
    updateIssue.mutate({
      id: issueId,
      archived_at: new Date().toISOString()
    });
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'destructive';
    if (priority >= 5) return 'warning';
    return 'secondary';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'Urgent';
    if (priority >= 5) return 'Important';
    return 'Normal';
  };

  if (isLoading) {
    return (
      <Section>
        <PageHeader title="Issues EOS" subtitle="Chargement..." />
      </Section>
    );
  }

  return (
    <Section>
      <PageHeader 
        title="🔥 Issues EOS"
        subtitle="Identifiez, discutez et résolvez les problèmes de votre entreprise"
        action={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle issue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de l'issue</Label>
                  <Input
                    id="title"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Décrivez le problème en quelques mots"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIssue.description}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Détaillez le problème et son contexte"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select value={newIssue.priority.toString()} onValueChange={(value) => setNewIssue(prev => ({ ...prev, priority: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 - Critique</SelectItem>
                      <SelectItem value="9">9 - Très urgent</SelectItem>
                      <SelectItem value="8">8 - Urgent</SelectItem>
                      <SelectItem value="7">7 - Important +</SelectItem>
                      <SelectItem value="6">6 - Important</SelectItem>
                      <SelectItem value="5">5 - Moyen</SelectItem>
                      <SelectItem value="4">4 - Faible +</SelectItem>
                      <SelectItem value="3">3 - Faible</SelectItem>
                      <SelectItem value="2">2 - Très faible</SelectItem>
                      <SelectItem value="1">1 - Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assigned_to">Assigné à (optionnel)</Label>
                  <Input
                    id="assigned_to"
                    value={newIssue.assigned_to}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, assigned_to: e.target.value }))}
                    placeholder="Email ou nom de la personne responsable"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateIssue} disabled={!newIssue.title || createIssue.isPending}>
                    {createIssue.isPending ? 'Création...' : 'Créer l\'issue'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {issues.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={CheckSquare}
              title="Aucune issue active"
              description="Parfait ! Vous n'avez actuellement aucun problème identifié. Utilisez le bouton ci-dessus pour créer une issue lorsque nécessaire."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Issues actives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Issues Actives ({issues.filter(i => i.status === 'open').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues
                  .filter(issue => issue.status === 'open')
                  .sort((a, b) => b.priority - a.priority)
                  .map((issue) => {
                    const daysSinceCreation = Math.floor(
                      (new Date().getTime() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div key={issue.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{issue.title}</h4>
                              <Badge variant={getPriorityColor(issue.priority)}>
                                {getPriorityLabel(issue.priority)} ({issue.priority}/10)
                              </Badge>
                              {daysSinceCreation > 14 && (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {daysSinceCreation}j
                                </Badge>
                              )}
                            </div>
                            {issue.description && (
                              <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Créé il y a {daysSinceCreation} jour{daysSinceCreation > 1 ? 's' : ''}</span>
                              {issue.assigned_to && <span>Assigné à: {issue.assigned_to}</span>}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveIssue(issue.id)}
                              disabled={updateIssue.isPending}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Résoudre
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchiveIssue(issue.id)}
                              disabled={updateIssue.isPending}
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              Archiver
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Issues résolues récentes */}
          {issues.some(issue => issue.status === 'resolved') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  Issues Résolues Récemment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issues
                    .filter(issue => issue.status === 'resolved')
                    .slice(0, 5)
                    .map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg bg-success/5">
                        <div>
                          <h5 className="font-medium">{issue.title}</h5>
                          <p className="text-sm text-muted-foreground">
                            Résolu le {new Date(issue.resolved_at!).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-success text-success-foreground">
                          Résolu
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Section>
  );
}
