import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ClientAdvanced } from "@/hooks/useClientsAdvanced";
import { 
  X, 
  ChevronDown, 
  Activity, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Play,
  BarChart3,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  Settings,
  Pause,
  Archive,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ClientDrawerProps {
  client: ClientAdvanced | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewVideo: (clientId: string) => void;
  onCreateTicket: (clientId: string) => void;
  onAdjustQuota: (clientId: string) => void;
  onAssignAM: (clientId: string) => void;
  onToggleStatus: (clientId: string, status: string) => void;
}

const getHealthScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

const getHealthReasons = (client: ClientAdvanced) => {
  const reasons = [];
  if (client.health_score < 70) {
    if (client.utilization && client.utilization.utilization_percent > 90) {
      reasons.push("Quota dépassé");
    }
    if (client.flags?.includes('low_engagement')) {
      reasons.push("Engagement faible");
    }
    if (!client.last_activity_at || 
        new Date(client.last_activity_at) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)) {
      reasons.push("Aucune activité 14j");
    }
  }
  return reasons;
};

export function ClientDrawer({ 
  client, 
  open, 
  onOpenChange, 
  onNewVideo, 
  onCreateTicket, 
  onAdjustQuota,
  onAssignAM,
  onToggleStatus
}: ClientDrawerProps) {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    production: false,
    pipeline: false,
    finance: false,
    tickets: false,
    integrations: false
  });

  if (!client) return null;

  const initials = client.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const healthReasons = getHealthReasons(client);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-hidden">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DrawerTitle className="text-xl">{client.name}</DrawerTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{client.segment}</Badge>
                  {client.account_manager && (
                    <span className="text-sm text-muted-foreground">
                      AM: {client.account_manager.display_name || client.account_manager.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Summary Section */}
          <Collapsible 
            open={expandedSections.summary} 
            onOpenChange={() => toggleSection('summary')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Résumé</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", 
                expandedSections.summary && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              {/* Health Score */}
              <div className="bg-card p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Score Santé</span>
                  <span className={cn("text-lg font-bold", getHealthScoreColor(client.health_score))}>
                    {client.health_score}/100
                  </span>
                </div>
                {healthReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {healthReasons.map((reason, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">MRR</div>
                  <div className="text-xl font-bold">{client.mrr.toLocaleString('fr-FR')}€</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Quota utilisé</div>
                  <div className="text-xl font-bold">{client.utilization?.utilization_percent || 0}%</div>
                  <Progress value={client.utilization?.utilization_percent || 0} className="mt-2" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => onNewVideo(client.id)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Nouvelle Vidéo
                </Button>
                <Button variant="outline" size="sm" onClick={() => onCreateTicket(client.id)}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Créer Ticket
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Rapport Hebdo
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Production Section */}
          <Collapsible 
            open={expandedSections.production} 
            onOpenChange={() => toggleSection('production')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                <span className="font-medium">Production (mois courant)</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", 
                expandedSections.production && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                {client.utilization?.published_count || 0} / {client.monthly_quota} vidéos livrées
              </div>
              
              {/* Mock production pipeline */}
              <div className="space-y-2">
                {['Ideas', 'Script', 'Tournage', 'Montage', 'Publication'].map((stage, index) => (
                  <div key={stage} className="flex items-center gap-3 p-2 bg-card rounded border">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="flex-1">{stage}</span>
                    <Badge variant="outline" className="text-xs">Terminé</Badge>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Pipeline & RDV */}
          <Collapsible 
            open={expandedSections.pipeline} 
            onOpenChange={() => toggleSection('pipeline')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Pipeline & RDV</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", 
                expandedSections.pipeline && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="text-sm text-muted-foreground">
                Prochains RDV et jalons à venir
              </div>
              {client.milestones && client.milestones.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {client.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-card rounded border">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{milestone.title}</span>
                      <span className="text-xs text-muted-foreground">{milestone.due_date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-muted-foreground">
                  Aucun jalon planifié
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Finance */}
          <Collapsible 
            open={expandedSections.finance} 
            onOpenChange={() => toggleSection('finance')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Finance</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", 
                expandedSections.finance && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-3 rounded border">
                  <div className="text-sm text-muted-foreground">MRR</div>
                  <div className="text-lg font-bold">{client.mrr.toLocaleString('fr-FR')}€</div>
                </div>
                <div className="bg-card p-3 rounded border">
                  <div className="text-sm text-muted-foreground">Impayés</div>
                  <div className="text-lg font-bold text-success">0€</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                <ExternalLink className="h-3 w-3 mr-1" />
                Ouvrir Stripe
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {/* Integrations */}
          <Collapsible 
            open={expandedSections.integrations} 
            onOpenChange={() => toggleSection('integrations')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Intégrations</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", 
                expandedSections.integrations && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="space-y-2">
                {Object.entries(client.integrations).map(([key, connected]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-card rounded border">
                    <span className="capitalize">{key}</span>
                    <Badge variant={connected ? "default" : "destructive"}>
                      {connected ? "Connecté" : "Déconnecté"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 bg-background">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAdjustQuota(client.id)}
            >
              <Settings className="h-3 w-3 mr-1" />
              Ajuster Quota
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onToggleStatus(client.id, client.status === 'active' ? 'paused' : 'active')}
            >
              {client.status === 'active' ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Mettre en Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Activer
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAssignAM(client.id)}
            >
              <UserCheck className="h-3 w-3 mr-1" />
              Assigner AM
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}