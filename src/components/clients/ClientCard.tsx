import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClientAdvanced } from "@/hooks/useClientsAdvanced";
import { Plus, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  client: ClientAdvanced;
  onSelect: (client: ClientAdvanced) => void;
  onNewVideo: (clientId: string) => void;
  onCreateTicket: (clientId: string) => void;
  onAdjustQuota: (clientId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'at_risk': return 'destructive';
    case 'onboarding': return 'info';
    case 'paused': return 'warning';
    case 'archived': return 'secondary';
    default: return 'primary';
  }
};

const getHealthScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

export function ClientCard({ 
  client, 
  onSelect, 
  onNewVideo, 
  onCreateTicket, 
  onAdjustQuota 
}: ClientCardProps) {
  const initials = client.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover-scale cursor-pointer group border-border/50" onClick={() => onSelect(client)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {client.name}
              </h3>
              {client.segment && (
                <Badge variant="outline" className="text-xs mt-1">
                  {client.segment}
                </Badge>
              )}
            </div>
          </div>
          <Badge variant={getStatusColor(client.status) as any}>
            {client.status === 'active' ? 'Actif' : 
             client.status === 'at_risk' ? 'À risque' : 
             client.status === 'onboarding' ? 'Onboarding' : 
             client.status === 'paused' ? 'En pause' : 'Archivé'}
          </Badge>
        </div>

        {client.account_manager && (
          <div className="text-sm text-muted-foreground">
            AM: {client.account_manager.display_name || client.account_manager.email}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Santé</span>
          <span className={cn("text-sm font-bold", getHealthScoreColor(client.health_score))}>
            {client.health_score}/100
          </span>
        </div>

        {/* Quota Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Quota utilisé</span>
            <span className="font-medium">
              {client.utilization?.published_count || 0}/{client.monthly_quota}
            </span>
          </div>
          <Progress 
            value={client.utilization?.utilization_percent || 0} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            {client.utilization?.utilization_percent || 0}% utilisé ce mois
          </div>
        </div>

        {/* Next Milestone */}
        {client.milestones && client.milestones.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Prochain:</span>
            <span className="font-medium">{client.milestones[0].title}</span>
          </div>
        )}

        {/* Flags/Alerts */}
        {client.flags && client.flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {client.flags.slice(0, 3).map((flag, index) => (
              <Badge key={index} variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {flag === 'low_engagement' ? 'Engagement faible' : flag}
              </Badge>
            ))}
          </div>
        )}

        {/* MRR */}
        {client.mrr > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{client.mrr.toLocaleString('fr-FR')}€ MRR</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onNewVideo(client.id)}
            disabled={client.status === 'paused' || client.status === 'archived'}
          >
            <Plus className="h-3 w-3 mr-1" />
            Vidéo
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onCreateTicket(client.id)}
          >
            Ticket
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onAdjustQuota(client.id)}
          >
            Quota
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}