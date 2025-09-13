
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { useRecentVideos } from "@/hooks/useVideos";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Video } from "lucide-react";

export function RecentVideosList() {
  const { data: videos, isLoading, error, refetch } = useRecentVideos();

  if (isLoading) {
    return <LoadingSkeleton variant="list" count={5} />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vidéos Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Video}
            title="Aucune vidéo trouvée"
            description="Commencez par créer votre première vidéo pour voir apparaître le suivi ici."
            action={{
              label: "Créer une vidéo",
              onClick: () => {
                // TODO: Ouvrir le dialog de création
                console.log("Open create video dialog");
              }
            }}
          />
        </CardContent>
      </Card>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'edit': return 'secondary';
      case 'shoot': return 'secondary';
      case 'script': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      idea: 'Idée',
      script: 'Script',
      shoot: 'Tournage',
      edit: 'Montage',
      published: 'Publié'
    };
    return labels[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vidéos Récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{video.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {video.clients?.name || 'Client non défini'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(video.status)}>
                    {getStatusLabel(video.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {video.due_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Échéance: {new Date(video.due_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {video.performance?.views && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Vues:</span>
                      <span className="font-medium">{video.performance.views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Engagement:</span>
                      <span className="font-medium text-success">{video.performance.engagement}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
