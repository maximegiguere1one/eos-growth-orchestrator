
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/common/StatCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { useClientKPIs } from "@/hooks/useClientsAdvanced";
import { Users, AlertTriangle, TrendingUp, Target, DollarSign } from "lucide-react";

export function ClientKPICards() {
  const { data: kpis, isLoading, error, refetch } = useClientKPIs();

  if (isLoading) {
    return <LoadingSkeleton variant="grid" count={5} />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!kpis) return null;

  const getAtRiskTone = (count: number) => {
    if (count === 0) return "success";
    if (count <= 2) return "warning";
    return "destructive";
  };

  const getQuotaTone = (percentage: number) => {
    if (percentage >= 60 && percentage <= 90) return "success";
    if (percentage > 90) return "destructive";
    return "warning";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard
        title="Total Clients"
        value={kpis.total_clients.toString()}
        tone="primary"
        icon={Users}
        change={kpis.total_clients > 0 ? "Clients actifs" : "Aucun client"}
      />

      <StatCard
        title="En Attention"
        value={kpis.at_risk_count.toString()}
        tone={getAtRiskTone(kpis.at_risk_count)}
        icon={AlertTriangle}
        alert={kpis.at_risk_count > 0 
          ? `${kpis.at_risk_count} client(s) nécessitent votre attention`
          : "Tous les comptes sont sains"
        }
      />

      <StatCard
        title="ROAS Moyen"
        value={kpis.average_roas > 0 ? `${kpis.average_roas.toFixed(1)}x` : "-"}
        tone="info"
        icon={TrendingUp}
        change={kpis.average_roas > 0 ? "30 derniers jours" : "Aucune donnée"}
      />

      <StatCard
        title="Quota Moyen"
        value={`${kpis.average_quota_usage}%`}
        tone={getQuotaTone(kpis.average_quota_usage)}
        icon={Target}
        progress={kpis.average_quota_usage}
        alert={kpis.average_quota_usage > 90 
          ? "Attention: capacité proche du maximum"
          : kpis.average_quota_usage < 60
            ? "Opportunité d'augmentation"
            : "Utilisation optimale"
        }
      />

      <StatCard
        title="MRR Total"
        value={kpis.total_mrr > 0 ? `${(kpis.total_mrr).toLocaleString('fr-FR')} €` : "0 €"}
        tone="success"
        icon={DollarSign}
        change="Revenus récurrents mensuels"
      />
    </div>
  );
}
