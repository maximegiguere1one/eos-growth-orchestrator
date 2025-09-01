
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ClientKPICards } from "@/components/clients/ClientKPICards";
import { ClientFiltersBar } from "@/components/clients/ClientFiltersBar";
import { ClientTable } from "@/components/clients/ClientTable";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { useClientsAdvanced, ClientFilters, ClientAdvanced } from "@/hooks/useClientsAdvanced";
import { 
  Plus, 
  Video, 
  Ticket, 
  Upload, 
  Users, 
  AlertTriangle,
  UserPlus,
  Play,
  Pause,
  Archive,
  Layout,
  Grid3X3
} from "lucide-react";

const ClientsAdvanced = () => {
  const [filters, setFilters] = useState<ClientFilters>({});
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(0);

  // Appliquer le filtre de tab au filtre global
  const tabFilters = useMemo(() => {
    const tabFilter: ClientFilters = { ...filters };
    
    switch (activeTab) {
      case 'at_risk':
        tabFilter.health_score_max = 59;
        break;
      case 'onboarding':
        tabFilter.status = ['onboarding'];
        break;
      case 'active':
        tabFilter.status = ['active'];
        break;
      case 'paused':
        tabFilter.status = ['paused'];
        break;
      case 'archived':
        tabFilter.status = ['archived'];
        break;
    }
    
    return tabFilter;
  }, [filters, activeTab]);

  const { 
    data: clientsData, 
    isLoading, 
    error, 
    refetch 
  } = useClientsAdvanced(tabFilters, page, 50);

  const clients = clientsData?.data || [];
  const totalClients = clientsData?.total || 0;

  const handleClientClick = (client: ClientAdvanced) => {
    console.log("Opening client drawer:", client);
    // TODO: Implémenter l'ouverture du drawer
  };

  const handleSaveView = () => {
    console.log("Saving current view:", { filters, activeTab });
    // TODO: Implémenter la sauvegarde de vue
  };

  const handleBulkAction = (action: string) => {
    console.log("Bulk action:", action, "for clients:", selectedClients);
    // TODO: Implémenter les actions de masse
  };

  const getTabCounts = () => {
    // TODO: Calculer les vrais comptes par tab à partir des données
    return {
      all: totalClients,
      at_risk: clients.filter(c => c.health_score < 60).length,
      onboarding: clients.filter(c => c.status === 'onboarding').length,
      active: clients.filter(c => c.status === 'active').length,
      paused: clients.filter(c => c.status === 'paused').length,
      archived: clients.filter(c => c.status === 'archived').length,
    };
  };

  const tabCounts = getTabCounts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={1} />
        <LoadingSkeleton variant="grid" count={5} />
        <LoadingSkeleton variant="card" count={1} />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion Clients</h1>
          <p className="text-muted-foreground">Cockpit opérationnel et suivi des comptes</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateClientDialog>
            <Button variant="premium">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Client
            </Button>
          </CreateClientDialog>
          <Button variant="outline">
            <Video className="h-4 w-4 mr-2" />
            Nouvelle Vidéo
          </Button>
          <Button variant="outline">
            <Ticket className="h-4 w-4 mr-2" />
            Nouveau Ticket
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <ClientKPICards />

      {/* Filtres */}
      <ClientFiltersBar 
        filters={filters}
        onFiltersChange={setFilters}
        onSaveView={handleSaveView}
      />

      {/* Actions de masse */}
      {selectedClients.length > 0 && (
        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedClients.length} client(s) sélectionné(s)
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('assign_am')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assigner AM
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('pause')}>
                <Pause className="h-4 w-4 mr-2" />
                Mettre en pause
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                <Play className="h-4 w-4 mr-2" />
                Activer
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                <Upload className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedClients([])}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs et vue */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              Tous
              {tabCounts.all > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="at_risk" className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              En attention
              {tabCounts.at_risk > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {tabCounts.at_risk}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center gap-2">
              Onboarding
              {tabCounts.onboarding > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.onboarding}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              Actifs
              {tabCounts.active > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.active}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="paused" className="flex items-center gap-2">
              En pause
              {tabCounts.paused > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.paused}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              Archivés
              {tabCounts.archived > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.archived}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Layout className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun client trouvé"
              description={
                activeTab === 'all' 
                  ? "Commencez par ajouter votre premier client."
                  : `Aucun client dans la catégorie "${activeTab}".`
              }
            />
          ) : (
            <div className="space-y-4">
              {viewMode === 'table' ? (
                <ClientTable
                  clients={clients}
                  selectedClients={selectedClients}
                  onSelectionChange={setSelectedClients}
                  onClientClick={handleClientClick}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* TODO: Implémenter ClientCards */}
                  <div className="text-muted-foreground text-center py-8">
                    Vue cartes à implémenter
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalClients > 50 && (
                <div className="flex items-center justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Précédent
                  </Button>
                  <span className="mx-4 text-sm text-muted-foreground">
                    Page {page + 1} sur {Math.ceil(totalClients / 50)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * 50 >= totalClients}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientsAdvanced;
