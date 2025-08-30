import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Recommendations() {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="text-primary">👉 Recommandations Prioritaires</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>• <strong>TechnoMax:</strong> Prioriser tournage cette semaine, quota vidéo critique</div>
          <div>• <strong>Ads:</strong> Investiguer hausse CPC TechnoMax, tester nouvelles créas</div>
          <div>• <strong>Élite Protection:</strong> Maintenir momentum, augmenter budget créa gagnante</div>
          <div>• <strong>Équipe:</strong> Planifier formation montage pour réduire goulot</div>
        </div>
      </CardContent>
    </Card>
  );
}