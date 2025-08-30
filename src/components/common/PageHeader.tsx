import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  gradient?: boolean;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  gradient = false,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col gap-4 pb-6 mb-6 border-b motion-safe:animate-fade-in",
      gradient && "bg-gradient-primary/10 backdrop-blur -mx-6 px-6 py-8 rounded-lg",
      className
    )}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}