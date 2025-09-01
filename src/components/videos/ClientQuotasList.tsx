
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useClientQuotas } from "@/hooks/useClients";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Users } from "lucide-react";

export function ClientQuotasList() {
  const { data: quotas, isLoading, error, refetch } = useClientQuotas();

  if (isLoading) {
    return <LoadingSkeleton className="h-64" />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!quotas || quotas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quota par Client</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="Aucun client trouvé"
            description="Ajoutez des clients pour voir leur quota de vidéos mensuelles."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quota par Client ({quotas[0]?.quota || 12}/mois)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quotas.map((client, index) => (
            <div key={index} className="flex items-center justify-between">
              <span>{client.name}</span>
              <div className="flex items-center gap-4 w-1/2">
                <Progress value={client.progress} className="flex-1" />
                <span className={`text-sm font-medium ${
                  client.progress < 50 ? 'text-destructive' : 'text-foreground'
                }`}>
                  {client.published}/{client.quota}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
