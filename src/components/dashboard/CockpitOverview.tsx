import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp } from "lucide-react";

const cockpitData = [
  {
    title: "Clients Actifs",
    value: "12",
    change: "+2 ce mois",
    trend: "up",
    color: "success"
  },
  {
    title: "Vidéos en Production",
    value: "87/144",
    progress: 60,
    alert: "3 en retard",
    color: "warning"
  },
  {
    title: "Budget Ads Actuel",
    value: "$42,500",
    subtitle: "ROAS moyen: 3.2x",
    color: "info"
  },
  {
    title: "Alertes Actives",
    value: "5",
    alert: "Action requise",
    color: "destructive"
  }
];

export function CockpitOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">📊 Vue Cockpit</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cockpitData.map((item, index) => (
          <Card key={index} className={`border-l-4 border-l-${item.color}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
            </CardHeader>
            <CardContent>
              {item.progress && (
                <>
                  <Progress value={item.progress} className="mb-2" />
                  <div className={`text-sm text-${item.color}`}>{item.alert}</div>
                </>
              )}
              {item.change && (
                <div className={`flex items-center text-sm text-${item.color}`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {item.change}
                </div>
              )}
              {item.subtitle && (
                <div className={`text-sm text-${item.color}`}>{item.subtitle}</div>
              )}
              {item.alert && !item.progress && (
                <div className={`flex items-center text-sm text-${item.color}`}>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {item.alert}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}