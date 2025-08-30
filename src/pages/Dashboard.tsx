import { CockpitOverview } from "@/components/dashboard/CockpitOverview";
import { DashboardSections } from "@/components/dashboard/DashboardSections";
import { Recommendations } from "@/components/dashboard/Recommendations";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <CockpitOverview />
      <DashboardSections />
      <Recommendations />
    </div>
  );
};

export default Dashboard;