import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Zap, 
  BarChart3,
  Users,
  Plus
} from 'lucide-react';
import { GrowthDashboard } from '@/components/growth/GrowthDashboard';
import { MetricsInputForm } from '@/components/growth/MetricsInputForm';
import { AutomatedWorkflows } from '@/components/growth/AutomatedWorkflows';
import { useClientsAdvanced } from '@/hooks/useClientsAdvanced';
import { useGrowthAlerts } from '@/hooks/useGrowthTracking';

export default function GrowthCenter() {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [showMetricsForm, setShowMetricsForm] = useState(false);
  
  const { data: clientsData } = useClientsAdvanced({}, 0, 100);
  const clients = clientsData?.data || [];
  const { data: globalAlerts } = useGrowthAlerts();

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centre de Croissance EOS</h1>
          <p className="text-muted-foreground">
            Assurez la croissance continue de vos clients avec l'EOS
          </p>
        </div>
        <div className="flex items-center gap-2">
          {globalAlerts && globalAlerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {globalAlerts.length} alertes
            </Badge>
          )}
          <Button onClick={() => setShowMetricsForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Saisir métriques
          </Button>
        </div>
      </div>

      {/* Sélection du client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sélectionner un client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clients.map((client) => (
              <Card 
                key={client.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedClientId === client.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedClientId(client.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{client.domain}</h3>
                    <Badge variant={
                      client.health_score >= 80 ? 'default' :
                      client.health_score >= 65 ? 'secondary' :
                      client.health_score >= 50 ? 'secondary' : 'destructive'
                    }>
                      {client.health_score}/100
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    MRR: {client.mrr?.toLocaleString('fr-FR')}€
                  </div>
                  <div className="text-sm text-muted-foreground">
                    AM: {client.account_manager?.display_name || 'Non assigné'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de saisie des métriques */}
      {showMetricsForm && (
        <Card>
          <CardHeader>
            <CardTitle>Saisir les métriques</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClientId ? (
              <MetricsInputForm
                clientId={selectedClientId}
                onSuccess={() => setShowMetricsForm(false)}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Veuillez d'abord sélectionner un client pour saisir ses métriques.
                </p>
                <Button variant="outline" onClick={() => setShowMetricsForm(false)}>
                  Fermer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contenu principal */}
      {selectedClientId && selectedClient ? (
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Métriques
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="eos-integration" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Intégration EOS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <GrowthDashboard 
              clientId={selectedClientId} 
              clientName={selectedClient.domain}
            />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricsInputForm
                clientId={selectedClientId}
                onSuccess={() => {
                  // Refresh data
                }}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Historique des métriques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Graphique d'historique des métriques
                    <br />
                    <small>À implémenter avec les données réelles</small>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <AutomatedWorkflows clientId={selectedClientId} />
          </TabsContent>

          <TabsContent value="eos-integration" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Intégration avec Issues EOS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Issues EOS Générés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Issues créés automatiquement basés sur les métriques de croissance
                    </div>
                    <Button variant="outline" className="w-full">
                      Voir les issues actifs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Intégration avec Rocks EOS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Rocks de Croissance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Objectifs trimestriels générés pour améliorer la croissance
                    </div>
                    <Button variant="outline" className="w-full">
                      Voir les rocks actifs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Intégration avec KPIs EOS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    KPIs Synchronisés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Métriques de croissance intégrées dans le scorecard EOS
                    </div>
                    <Button variant="outline" className="w-full">
                      Configurer les KPIs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions rapides EOS */}
            <Card>
              <CardHeader>
                <CardTitle>Actions EOS Recommandées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium mb-1">Créer un Issue de Croissance</div>
                    <div className="text-sm text-muted-foreground text-left">
                      Identifier et résoudre les blocages à la croissance
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium mb-1">Définir un Rock de Croissance</div>
                    <div className="text-sm text-muted-foreground text-left">
                      Objectif trimestriel pour améliorer les métriques clés
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium mb-1">Planifier une L10 Croissance</div>
                    <div className="text-sm text-muted-foreground text-left">
                      Réunion dédiée à l'analyse de la croissance client
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium mb-1">Mettre à jour les KPIs</div>
                    <div className="text-sm text-muted-foreground text-left">
                      Synchroniser les métriques avec le scorecard EOS
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Sélectionnez un client</h3>
            <p className="text-muted-foreground mb-6">
              Choisissez un client ci-dessus pour commencer le suivi de croissance EOS
            </p>
            {clients.length === 0 && (
              <Button variant="outline">
                Ajouter votre premier client
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
