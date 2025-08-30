import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function Section({ 
  children, 
  className,
  animate = true 
}: SectionProps) {
  return (
    <div className={cn(
      "space-y-6",
      animate && "motion-safe:animate-fade-in",
      className
    )}>
      {children}
    </div>
  );
}