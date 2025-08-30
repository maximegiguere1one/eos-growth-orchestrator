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
  success: "border-l-success text-success",
  warning: "border-l-warning text-warning", 
  info: "border-l-info text-info",
  destructive: "border-l-destructive text-destructive",
  primary: "border-l-primary text-primary"
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
      "border-l-4 motion-safe:animate-fade-in hover-scale",
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
              <div className={cn("text-sm", toneClasses[tone])}>{alert}</div>
            )}
          </>
        )}
        {change && (
          <div className={cn("text-sm", toneClasses[tone])}>
            {change}
          </div>
        )}
        {alert && progress === undefined && (
          <div className={cn("text-sm", toneClasses[tone])}>
            {alert}
          </div>
        )}
      </CardContent>
    </Card>
  );
}