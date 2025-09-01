import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientJourneyTracker from "@/components/growth/ClientJourneyTracker";
import GrowthForecastingTools from "@/components/growth/GrowthForecastingTools";
import AutomationWorkflows from "@/components/growth/AutomationWorkflows";
import { BarChart3, Map, Bot } from "lucide-react";

const AdvancedGrowthTools = () => {
  const [activeTab, setActiveTab] = useState("forecasting");

  // Récupérer le tab depuis l'URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['forecasting', 'journey', 'automation'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            🚀 Outils de Croissance Avancés
          </h1>
          <p className="text-muted-foreground mt-2">
            Suite complète d'outils pour optimiser et automatiser la croissance client
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecasting" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Modélisation
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Parcours Client
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Automatisation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting">
          <GrowthForecastingTools />
        </TabsContent>

        <TabsContent value="journey">
          <ClientJourneyTracker />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationWorkflows />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedGrowthTools;