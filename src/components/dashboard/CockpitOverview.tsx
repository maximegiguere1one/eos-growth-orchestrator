import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { AlertTriangle, TrendingUp, Users, Video, DollarSign } from "lucide-react";

const cockpitData = [
  {
    title: "Clients Actifs",
    value: "12",
    change: "+2 ce mois",
    icon: Users,
    tone: "success" as const
  },
  {
    title: "Vidéos en Production",
    value: "87/144",
    progress: 60,
    alert: "3 en retard",
    icon: Video,
    tone: "warning" as const
  },
  {
    title: "Budget Ads Actuel",
    value: "$42,500",
    change: "ROAS moyen: 3.2x",
    icon: DollarSign,
    tone: "info" as const
  },
  {
    title: "Alertes Actives",
    value: "5",
    alert: "Action requise",
    icon: AlertTriangle,
    tone: "destructive" as const
  }
];

export function CockpitOverview() {
  return (
    <Section>
      <PageHeader 
        title="📊 Vue Cockpit"
        subtitle="Aperçu temps réel de votre agence"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cockpitData.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            tone={item.tone}
            progress={item.progress}
            change={item.change}
            icon={item.icon}
            alert={item.alert}
          />
        ))}
      </div>
    </Section>
  );
}