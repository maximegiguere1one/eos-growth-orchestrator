import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EOSCardProps {
  title: string;
  status: string;
  progress: number;
  description: string;
  onClick: () => void;
}

// Memoized card component to prevent unnecessary re-renders
export const OptimizedEOSCard = memo(function EOSCard({ 
  title, 
  status, 
  progress, 
  description, 
  onClick 
}: EOSCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer hover-scale" 
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge 
            variant={
              status === "Jour" ? "default" : 
              status === "Attention" ? "destructive" : "secondary"
            }
            className={cn(
              status === "Jour" && "bg-success text-success-foreground"
            )}
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progression</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
});