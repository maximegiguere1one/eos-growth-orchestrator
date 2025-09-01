
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoStatsCards } from "@/components/videos/VideoStatsCards";
import { VideoPipeline } from "@/components/videos/VideoPipeline";
import { RecentVideosList } from "@/components/videos/RecentVideosList";
import { ClientQuotasList } from "@/components/videos/ClientQuotasList";

const Videos = () => {
  const handleNewVideo = () => {
    // TODO: Implémenter l'ouverture du dialog de création de vidéo
    console.log("Nouvelle vidéo");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production Vidéos</h1>
          <p className="text-muted-foreground">Suivi de la production vidéo en temps réel</p>
        </div>
        <Button variant="premium" onClick={handleNewVideo}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Vidéo
        </Button>
      </div>

      {/* Global Stats */}
      <VideoStatsCards />

      {/* Production Pipeline */}
      <VideoPipeline />

      {/* Recent Videos */}
      <RecentVideosList />

      {/* Quota par Client */}
      <ClientQuotasList />
    </div>
  );
};

export default Videos;
