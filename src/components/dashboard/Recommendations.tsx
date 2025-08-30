import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Recommendations() {
  return (
    <Card className="border-l-2 border-l-muted/40 motion-safe:animate-fade-in">
      <CardHeader>
        <CardTitle className="text-foreground">👉 Recommandations Prioritaires</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm" role="status" aria-live="polite">
          <div>• <strong>TechnoMax:</strong> Prioriser tournage cette semaine, quota vidéo critique</div>
          <div>• <strong>Ads:</strong> Investiguer hausse CPC TechnoMax, tester nouvelles créas</div>
          <div>• <strong>Élite Protection:</strong> Maintenir momentum, augmenter budget créa gagnante</div>
          <div>• <strong>Équipe:</strong> Planifier formation montage pour réduire goulot</div>
        </div>
      </CardContent>
    </Card>
  );
}