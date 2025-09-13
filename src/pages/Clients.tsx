import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { useClients, useClientQuotas } from "@/hooks/useClients";
import { Plus, Users, TrendingUp } from "lucide-react";

const Clients = () => {
  const { data: clients, isLoading: clientsLoading, error: clientsError, refetch: refetchClients } = useClients();
  const { data: quotas, isLoading: quotasLoading, error: quotasError } = useClientQuotas();

  const isLoading = clientsLoading || quotasLoading;
  const hasError = clientsError || quotasError;
  const hasClients = clients && clients.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={1} />
        <LoadingSkeleton variant="grid" count={4} />
        <LoadingSkeleton variant="card" count={1} />
      </div>
    );
  }

  if (hasError) {
    return <ErrorState onRetry={() => refetchClients()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion Clients</h1>
          <p className="text-muted-foreground">Suivi complet de tous les clients actifs</p>
        </div>
        <CreateClientDialog>
          <Button variant="premium">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Client
          </Button>
        </CreateClientDialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Clients</CardTitle>
            <div className="text-2xl font-bold text-foreground">{clients?.length || 0}</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {hasClients ? "Clients actifs" : "Aucun client ajouté"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">En Attention</CardTitle>
            <div className="text-2xl font-bold text-foreground">0</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">-</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">ROAS Moyen</CardTitle>
            <div className="text-2xl font-bold text-foreground">-</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Aucune donnée</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Quota Moyen</CardTitle>
            <div className="text-2xl font-bold text-foreground">
              {quotas && quotas.length > 0 
                ? `${Math.round(quotas.reduce((acc, q) => acc + q.progress, 0) / quotas.length)}%`
                : "0%"
              }
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={quotas && quotas.length > 0 
                ? quotas.reduce((acc, q) => acc + q.progress, 0) / quotas.length
                : 0
              } 
            />
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {!hasClients ? (
        <div className="text-center">
          <EmptyState 
            icon={Users}
            title="Aucun client trouvé"
            description="Commencez par ajouter votre premier client pour gérer vos campagnes et suivre les performances."
          />
          <div className="mt-6">
            <CreateClientDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un client
              </Button>
            </CreateClientDialog>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quota: {client.monthly_quota} vidéos/mois
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {client.is_active ? "Actif" : "Inactif"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clients;