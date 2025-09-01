import { Section } from "@/components/common/Section";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClientKPIs } from "@/hooks/useClientsAdvanced";
import { useClientCheckinsSummary, useCreateClientCheckin } from "@/hooks/useClientCheckins";
import { AlertTriangle, CalendarCheck, Heart, Users } from "lucide-react";

const Growth = () => {
  const { data: kpis } = useClientKPIs();
  const { data: checkinsSummary } = useClientCheckinsSummary();
  const createCheckin = useCreateClientCheckin();

  return (
    <div className="space-y-8">
      <Section>
        <PageHeader
          title="🚀 Croissance Clients"
          subtitle="Votre espace pour piloter la santé, les check-ins et l'expansion client"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Clients Actifs"
            value={(kpis?.total_clients ?? 0).toString()}
            icon={Users}
            tone="primary"
            change={kpis?.total_clients ? "Comptes suivis" : "Aucun client"}
          />
          <StatCard
            title="Check-ins (4 sem)"
            value={(checkinsSummary?.recentCount ?? 0).toString()}
            icon={CalendarCheck}
            tone={(checkinsSummary?.recentCount ?? 0) > 0 ? "success" : "warning"}
            change={checkinsSummary?.lastWeekCount !== undefined ? `${checkinsSummary.lastWeekCount} la semaine dernière` : undefined}
          />
          <StatCard
            title="Santé moyenne"
            value={checkinsSummary?.avgHealth !== undefined ? `${checkinsSummary.avgHealth}%` : "-"}
            icon={Heart}
            tone={checkinsSummary && checkinsSummary.avgHealth >= 75 ? "success" : "warning"}
            alert={checkinsSummary && checkinsSummary.avgHealth < 60 ? "Plusieurs comptes à risque" : undefined}
          />
          <StatCard
            title="Alertes"
            value={kpis?.at_risk_count !== undefined ? kpis.at_risk_count.toString() : "-"}
            icon={AlertTriangle}
            tone={kpis && kpis.at_risk_count > 0 ? "destructive" : "success"}
            change={kpis && kpis.at_risk_count > 0 ? "Action requise" : "Tous les comptes sont sains"}
          />
        </div>
      </Section>

      <Section>
        <Card>
          <CardHeader>
            <CardTitle>Check-ins Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-muted-foreground">
                Enregistrez un check-in hebdomadaire par client: score de santé et notes clés.
              </div>
              <div>
                <Button
                  onClick={() =>
                    createCheckin.mutate({
                      // Placeholder minimal payload; UI détaillé à venir
                      client_id: "00000000-0000-0000-0000-000000000000",
                      week_start_date: new Date().toISOString().slice(0, 10),
                      health_score: 80,
                      notes: "Check-in rapide",
                    })
                  }
                  disabled={createCheckin.isPending}
                >
                  Ajouter un check-in (exemple)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
};

export default Growth;

