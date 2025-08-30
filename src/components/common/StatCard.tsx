import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  tone?: "success" | "warning" | "info" | "destructive" | "primary";
  progress?: number;
  change?: string;
  icon?: LucideIcon;
  alert?: string;
  className?: string;
}

const toneClasses = {
  success: "border-l-2 border-l-success/20",
  warning: "border-l-2 border-l-warning/20", 
  info: "border-l-2 border-l-info/20",
  destructive: "border-l-2 border-l-destructive/20",
  primary: "border-l-2 border-l-muted/20"
};

export function StatCard({ 
  title, 
  value, 
  tone = "primary",
  progress,
  change,
  icon: Icon,
  alert,
  className 
}: StatCardProps) {
  return (
    <Card className={cn(
      "motion-safe:animate-fade-in hover-scale border-border/50",
      toneClasses[tone],
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </CardTitle>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardHeader>
      <CardContent>
        {progress !== undefined && (
          <>
            <Progress value={progress} className="mb-2" />
            {alert && (
              <div className="text-sm text-muted-foreground">{alert}</div>
            )}
          </>
        )}
        {change && (
          <div className="text-sm text-muted-foreground">
            {change}
          </div>
        )}
        {alert && progress === undefined && (
          <div className="text-sm text-muted-foreground">
            {alert}
          </div>
        )}
      </CardContent>
    </Card>
  );
}