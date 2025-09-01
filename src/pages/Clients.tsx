import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/common/EmptyState";
import { Plus, Users, TrendingUp } from "lucide-react";

const Clients = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion Clients</h1>
          <p className="text-muted-foreground">Suivi complet de tous les clients actifs</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Client
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Clients</CardTitle>
            <div className="text-2xl font-bold text-foreground">0</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Aucun client ajouté</div>
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

        <Card className="border-l-4 border-l-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Quota Vidéos</CardTitle>
            <div className="text-2xl font-bold text-foreground">0%</div>
          </CardHeader>
          <CardContent>
            <Progress value={0} />
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <EmptyState 
        icon={Users}
        title="Aucun client trouvé"
        description="Commencez par ajouter votre premier client pour gérer vos campagnes et suivre les performances."
        action={{
          label: "Ajouter un client",
          onClick: () => console.log("Ajouter un client")
        }}
      />
    </div>
  );
};

export default Clients;