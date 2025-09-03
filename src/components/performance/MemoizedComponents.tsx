import React, { memo } from 'react';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientAdvanced } from '@/hooks/useClientsAdvanced';
import { EOSIssue, EOSRock } from '@/hooks/useEOS';

// Memoized StatCard to prevent unnecessary re-renders
export const MemoizedStatCard = memo(StatCard);

// Memoized Badge component
export const MemoizedBadge = memo(Badge);

// Memoized Button component
export const MemoizedButton = memo(Button);

// Memoized Client Card for better performance in lists
interface ClientCardProps {
  client: ClientAdvanced;
  onSelect: (client: ClientAdvanced) => void;
  onNewVideo: (clientId: string) => void;
  onCreateTicket: (clientId: string) => void;
  onAdjustQuota: (clientId: string) => void;
}

export const MemoizedClientCard = memo<ClientCardProps>(({ 
  client, 
  onSelect, 
  onNewVideo, 
  onCreateTicket, 
  onAdjustQuota 
}) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'onboarding': return 'secondary';
      case 'paused': return 'warning';
      case 'archived': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {client.name}
            </CardTitle>
            <div className="text-sm text-muted-foreground truncate">
              {client.domain || 'Domaine non défini'}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <div className={`w-3 h-3 rounded-full ${getHealthColor(client.health_score)}`} />
            <span className="text-sm font-medium">{client.health_score}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Statut</span>
            <MemoizedBadge variant={getStatusColor(client.status) as any}>
              {client.status}
            </MemoizedBadge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">MRR</span>
            <span className="text-sm font-medium">
              ${client.mrr?.toLocaleString() || '0'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">AM</span>
            <span className="text-sm font-medium truncate max-w-[120px]">
              {client.account_manager?.display_name || client.account_manager?.email || 'Non assigné'}
            </span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <MemoizedButton 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onNewVideo(client.id);
              }}
              className="flex-1"
            >
              Vidéo
            </MemoizedButton>
            <MemoizedButton 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onCreateTicket(client.id);
              }}
              className="flex-1"
            >
              Ticket
            </MemoizedButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.client.id === nextProps.client.id &&
    prevProps.client.health_score === nextProps.client.health_score &&
    prevProps.client.status === nextProps.client.status &&
    prevProps.client.mrr === nextProps.client.mrr &&
    prevProps.client.account_manager === nextProps.client.account_manager
  );
});

// Memoized EOS Issue Card
interface IssueCardProps {
  issue: EOSIssue;
  onUpdate: (id: string, updates: Partial<EOSIssue>) => void;
}

export const MemoizedIssueCard = memo<IssueCardProps>(({ issue, onUpdate }) => {
  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'destructive';
    if (priority >= 5) return 'secondary';
    return 'secondary';
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium line-clamp-2">
            {issue.title}
          </CardTitle>
          <MemoizedBadge variant={getPriorityColor(issue.priority)}>
            P{issue.priority}
          </MemoizedBadge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {issue.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {issue.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {issue.assigned_to || 'Non assigné'}
          </span>
          <MemoizedButton
            size="sm"
            variant={issue.status === 'resolved' ? 'secondary' : 'default'}
            onClick={() => onUpdate(issue.id, { 
              status: issue.status === 'resolved' ? 'open' : 'resolved' 
            })}
          >
            {issue.status === 'resolved' ? 'Rouvrir' : 'Résoudre'}
          </MemoizedButton>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.issue.id === nextProps.issue.id &&
    prevProps.issue.status === nextProps.issue.status &&
    prevProps.issue.priority === nextProps.issue.priority &&
    prevProps.issue.title === nextProps.issue.title &&
    prevProps.issue.assigned_to === nextProps.issue.assigned_to
  );
});

// Memoized EOS Rock Card
interface RockCardProps {
  rock: EOSRock;
  onUpdate: (id: string, updates: Partial<EOSRock>) => void;
}

export const MemoizedRockCard = memo<RockCardProps>(({ rock, onUpdate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'secondary';
      case 'on_track': return 'secondary';
      case 'at_risk': return 'destructive';
      case 'not_started': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium line-clamp-2">
            {rock.title}
          </CardTitle>
          <MemoizedBadge variant={getStatusColor(rock.status)}>
            {rock.status.replace('_', ' ')}
          </MemoizedBadge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {rock.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {rock.description}
          </p>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progrès</span>
            <span className="font-medium">{rock.progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${rock.progress}%` }}
            />
          </div>
          {rock.due_date && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Échéance</span>
              <span>{new Date(rock.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.rock.id === nextProps.rock.id &&
    prevProps.rock.status === nextProps.rock.status &&
    prevProps.rock.progress === nextProps.rock.progress &&
    prevProps.rock.title === nextProps.rock.title &&
    prevProps.rock.due_date === nextProps.rock.due_date
  );
});

MemoizedClientCard.displayName = 'MemoizedClientCard';
MemoizedIssueCard.displayName = 'MemoizedIssueCard';
MemoizedRockCard.displayName = 'MemoizedRockCard';
