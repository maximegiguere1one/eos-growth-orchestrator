import React, { Suspense, memo } from 'react';
import { MemoizedStatCard } from '@/components/performance/MemoizedComponents';
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { useNavigate } from "react-router-dom";
import { useEOSSummaryOptimized } from "@/hooks/useEOSOptimized";
import { AlertTriangle, TrendingUp, Users, Video, DollarSign, Calendar, Building2 } from "lucide-react";

// Memoized cockpit data to prevent recreation
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

// Memoized Cockpit Overview
const OptimizedCockpitOverview = memo(() => {
  return (
    <Section>
      <PageHeader 
        title="📊 Vue Cockpit"
        subtitle="Aperçu temps réel de votre agence"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cockpitData.map((item, index) => (
          <MemoizedStatCard
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
});

// Memoized EOS Section with optimized data fetching
const OptimizedEOSSection = memo(() => {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useEOSSummaryOptimized();

  // Prefetch EOS page on component mount (not on every render)
  React.useEffect(() => {
    const prefetchEOS = () => {
      import('@/pages/EOS').catch(() => {
        // Silently fail prefetch
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchEOS);
    } else {
      setTimeout(prefetchEOS, 100);
    }
  }, []);

  const handleEOSClick = React.useCallback(() => {
    navigate('/eos');
  }, [navigate]);

  const handleIssuesClick = React.useCallback(() => {
    navigate('/eos/issues');
  }, [navigate]);

  const handleRocksClick = React.useCallback(() => {
    navigate('/eos/rocks');
  }, [navigate]);

  const handleScorecardClick = React.useCallback(() => {
    navigate('/scorecard');
  }, [navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          EOS Model
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Issues Actives</span>
            <Badge variant={(summary?.data?.activeIssuesCount || 0) > 0 ? "destructive" : "default"}>
              {isLoading ? "..." : (summary?.data?.activeIssuesCount || 0)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Rocks Complétés</span>
            <span className="text-sm font-semibold">
              {isLoading ? "..." : `${summary?.data?.completedRocksCount || 0}/${summary?.data?.rocksCount || 0}`}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Rocks À Risque</span>
            <Badge variant={(summary?.data?.atRiskRocksCount || 0) > 0 ? "destructive" : "secondary"}>
              {isLoading ? "..." : (summary?.data?.atRiskRocksCount || 0)}
            </Badge>
          </div>
          
          <div className="border-t pt-3 space-y-2">
            <Button 
              onClick={handleEOSClick}
              className="w-full" 
              size="sm"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Voir le Dashboard EOS
            </Button>
            
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handleIssuesClick} variant="outline" size="sm">
                Issues
              </Button>
              <Button onClick={handleRocksClick} variant="outline" size="sm">
                Rocks
              </Button>
              <Button onClick={handleScorecardClick} variant="outline" size="sm">
                KPIs
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Memoized Client Management Section
const OptimizedClientSection = memo(() => {
  const navigate = useNavigate();

  const handleClientsClick = React.useCallback(() => {
    navigate('/clients');
  }, [navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          Gestion Clients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Users}
          title="Aucun client configuré"
          description="Connectez vos données clients pour voir les statistiques en temps réel."
          action={{
            label: "Configurer les clients",
            onClick: handleClientsClick
          }}
        />
      </CardContent>
    </Card>
  );
});

// Memoized Video Section
const OptimizedVideoSection = memo(() => {
  const navigate = useNavigate();

  const handleVideosClick = React.useCallback(() => {
    navigate('/videos');
  }, [navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-muted-foreground" />
          Production Vidéos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Video}
          title="Production non configurée"
          description="Configurez vos workflows de production vidéo."
          action={{
            label: "Configurer la production",
            onClick: handleVideosClick
          }}
        />
      </CardContent>
    </Card>
  );
});

// Memoized Ads Section
const OptimizedAdsSection = memo(() => {
  const navigate = useNavigate();

  const handleAdsClick = React.useCallback(() => {
    navigate('/ads');
  }, [navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          Performance Ads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={AlertTriangle}
          title="Publicités non configurées"
          description="Connectez vos comptes publicitaires pour suivre les performances."
          action={{
            label: "Configurer les ads",
            onClick: handleAdsClick
          }}
        />
      </CardContent>
    </Card>
  );
});

// Main optimized dashboard component
export const OptimizedDashboard = memo(() => {
  return (
    <div className="space-y-8">
      <OptimizedCockpitOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OptimizedClientSection />
        <OptimizedVideoSection />
        <OptimizedAdsSection />
        <OptimizedEOSSection />
      </div>
    </div>
  );
});

OptimizedCockpitOverview.displayName = 'OptimizedCockpitOverview';
OptimizedEOSSection.displayName = 'OptimizedEOSSection';
OptimizedClientSection.displayName = 'OptimizedClientSection';
OptimizedVideoSection.displayName = 'OptimizedVideoSection';
OptimizedAdsSection.displayName = 'OptimizedAdsSection';
OptimizedDashboard.displayName = 'OptimizedDashboard';

export default OptimizedDashboard;
