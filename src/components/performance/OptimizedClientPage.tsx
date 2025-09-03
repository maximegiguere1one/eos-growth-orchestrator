import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ClientKPICards } from "@/components/clients/ClientKPICards";
import { ClientFiltersBar } from "@/components/clients/ClientFiltersBar";
import { OptimizedClientTable } from '@/components/performance/VirtualizedClientTable';
import { MemoizedClientCard } from "@/components/performance/MemoizedComponents";
import { ClientDrawer } from "@/components/clients/ClientDrawer";
import { BulkActionsBar } from "@/components/clients/BulkActionsBar";
import { CreateVideoDialog } from "@/components/clients/CreateVideoDialog";
import { AdjustQuotaDialog } from "@/components/clients/AdjustQuotaDialog";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { useClientsAdvanced, ClientFilters, ClientAdvanced } from "@/hooks/useClientsAdvanced";
import { 
  Plus, 
  Video, 
  AlertTriangle, 
  Upload, 
  Users, 
  LayoutGrid, 
  List,
} from "lucide-react";

// Optimized version of ClientsAdvanced with performance improvements
const OptimizedClientPage = React.memo(() => {
  const [filters, setFilters] = useState<ClientFilters>({});
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(0);
  const [selectedClient, setSelectedClient] = useState<ClientAdvanced | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
  const [quotaDialogClient, setQuotaDialogClient] = useState<ClientAdvanced | null>(null);

  // Memoized tab filters to prevent unnecessary recalculations
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

  // Memoized event handlers to prevent re-renders
  const handleClientClick = useCallback((client: ClientAdvanced) => {
    setSelectedClient(client);
    setDrawerOpen(true);
  }, []);

  const handleSaveView = useCallback((name: string) => {
    console.log('Save view:', name);
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    console.log('Bulk action:', action, selectedClients);
  }, [selectedClients]);

  const handleNewVideo = useCallback((clientId: string) => {
    console.log('Create video for client:', clientId);
  }, []);

  const handleCreateTicket = useCallback((clientId: string) => {
    console.log('Create ticket for client:', clientId);
  }, []);

  const handleAdjustQuota = useCallback((clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    if (client) {
      setQuotaDialogClient(client);
      setQuotaDialogOpen(true);
    }
  }, [clients]);

  const handleAssignAM = useCallback((clientId: string) => {
    console.log('Assign AM for client:', clientId);
  }, []);

  const handleToggleStatus = useCallback((clientId: string, status: string) => {
    console.log('Toggle status for client:', clientId, status);
  }, []);

  // Memoized tab counts calculation
  const tabCounts = useMemo(() => {
    if (!clients.length) {
      return {
        all: 0,
        at_risk: 0,
        onboarding: 0,
        active: 0,
        paused: 0,
        archived: 0,
      };
    }

    return {
      all: totalClients,
      at_risk: clients.filter(c => c.health_score < 60).length,
      onboarding: clients.filter(c => c.status === 'onboarding').length,
      active: clients.filter(c => c.status === 'active').length,
      paused: clients.filter(c => c.status === 'paused').length,
      archived: clients.filter(c => c.status === 'archived').length,
    };
  }, [clients, totalClients]);

  // Memoized pagination handlers
  const handlePrevPage = useCallback(() => {
    setPage(p => Math.max(0, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const handleViewModeChange = useCallback((mode: 'table' | 'cards') => {
    setViewMode(mode);
  }, []);

  // Selection handlers for table
  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedClients(clients.map(c => c.id));
  }, [clients]);

  const handleClearSelection = useCallback(() => {
    setSelectedClients([]);
  }, []);

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
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
          <CreateVideoDialog>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Nouvelle Vidéo
            </Button>
          </CreateVideoDialog>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Nouveau Ticket
          </Button>
          <CreateClientDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Client
            </Button>
          </CreateClientDialog>
        </div>
      </div>

      {/* KPIs */}
      <ClientKPICards />

      {/* Filtres */}
      <ClientFiltersBar 
        filters={filters}
        onFiltersChange={setFilters}
        onSaveView={() => handleSaveView('Vue actuelle')}
      />

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedClients.length}
        onClearSelection={() => setSelectedClients([])}
        onAssignAM={() => handleBulkAction('assign_am')}
        onToggleStatus={(action) => handleBulkAction(`toggle_${action}`)}
        onAdjustQuota={() => handleBulkAction('adjust_quota')}
        onSendReport={() => handleBulkAction('send_report')}
        onExportCsv={() => handleBulkAction('export_csv')}
        onArchive={() => handleBulkAction('archive')}
      />

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
              onClick={() => handleViewModeChange('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('cards')}
            >
              <LayoutGrid className="h-4 w-4" />
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
            <div className="space-y-6">
              {viewMode === 'table' ? (
                <OptimizedClientTable
                  clients={clients}
                  selectedClients={selectedClients}
                  onSelectClient={handleSelectClient}
                  onSelectAll={handleSelectAll}
                  onClearSelection={handleClearSelection}
                  onClientClick={handleClientClick}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {clients.map((client) => (
                    <MemoizedClientCard
                      key={client.id}
                      client={client}
                      onSelect={handleClientClick}
                      onNewVideo={handleNewVideo}
                      onCreateTicket={handleCreateTicket}
                      onAdjustQuota={handleAdjustQuota}
                    />
                  ))}
                </div>
              )}

              {/* Pagination optimisée */}
              {totalClients > 50 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={page === 0}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1} sur {Math.ceil(totalClients / 50)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
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

      {/* Client Drawer */}
      <ClientDrawer
        client={selectedClient}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onNewVideo={handleNewVideo}
        onCreateTicket={handleCreateTicket}
        onAdjustQuota={handleAdjustQuota}
        onAssignAM={handleAssignAM}
        onToggleStatus={handleToggleStatus}
      />

      {/* Adjust Quota Dialog */}
      <AdjustQuotaDialog
        client={quotaDialogClient}
        open={quotaDialogOpen}
        onOpenChange={setQuotaDialogOpen}
      />
    </div>
  );
});

OptimizedClientPage.displayName = 'OptimizedClientPage';

export default OptimizedClientPage;
