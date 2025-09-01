
import { StatCard } from "@/components/common/StatCard";
import { Video, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useVideoStats } from "@/hooks/useVideos";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";

export function VideoStatsCards() {
  const { data: stats, isLoading, error, refetch } = useVideoStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Quota Mensuel"
        value={`${stats.published}/144`}
        icon={Video}
        tone="primary"
        progress={stats.quotaUsage}
        alert={stats.overdueTasks > 0 ? `${stats.overdueTasks} en retard` : undefined}
      />

      <StatCard
        title="Publiées"
        value={stats.published.toString()}
        icon={CheckCircle}
        tone="success"
        change={`${stats.quotaUsage}% du quota`}
      />

      <StatCard
        title="En Production"
        value={stats.inProduction.toString()}
        icon={Clock}
        tone="warning"
        change="Scripts + Tournage + Montage"
      />

      <StatCard
        title="En Attente"
        value={stats.pending.toString()}
        icon={AlertTriangle}
        tone="info"
        change="À planifier"
      />
    </div>
  );
}
