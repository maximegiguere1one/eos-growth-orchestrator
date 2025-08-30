import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EOSRock } from "@/hooks/useEOS";

interface RockCardProps {
  rock: EOSRock;
}

// Memoized rock card component
export const OptimizedRockCard = memo(function RockCard({ rock }: RockCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'on_track': return 'secondary';
      case 'at_risk': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété';
      case 'on_track': return 'En cours';
      case 'at_risk': return 'À risque';
      default: return 'Non démarré';
    }
  };

  return (
    <div className="border rounded-lg p-4 motion-safe:animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{rock.title}</h4>
        <Badge 
          variant={getStatusColor(rock.status)}
          className={cn(
            rock.status === "completed" && "bg-success text-success-foreground"
          )}
        >
          {getStatusLabel(rock.status)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="text-sm">
          <span className="text-muted-foreground">Propriétaire: </span>
          <span className="font-medium">{rock.owner_id || 'Non assigné'}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Échéance: </span>
          <span className="font-medium">{rock.due_date || 'Non définie'}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Progression: </span>
          <span className="font-medium">{rock.progress}%</span>
        </div>
      </div>
      
      <Progress value={rock.progress} />
    </div>
  );
});