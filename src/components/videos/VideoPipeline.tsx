
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
import { useVideosByStatus } from "@/hooks/useVideos";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";

export function VideoPipeline() {
  const { data: statusData, isLoading, error, refetch } = useVideosByStatus();

  if (isLoading) {
    return <LoadingSkeleton variant="grid" count={5} />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Pipeline de Production
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {statusData?.map((status, index) => (
            <div key={index} className="text-center p-4 rounded-lg border">
              <div className={`w-8 h-8 rounded-full ${status.color} mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                {status.count}
              </div>
              <div className="font-semibold">{status.label}</div>
              <div className="text-sm text-muted-foreground">
                {status.count} vidéos
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
