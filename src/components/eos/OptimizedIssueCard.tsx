import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EOSIssue } from "@/hooks/useEOS";

interface IssueCardProps {
  issue: EOSIssue;
}

// Memoized issue card component
export const OptimizedIssueCard = memo(function IssueCard({ issue }: IssueCardProps) {
  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'border-l-destructive bg-destructive/5';
    if (priority >= 5) return 'border-l-warning bg-warning/5';
    return 'border-l-info bg-info/5';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'Urgent';
    if (priority >= 5) return 'Important';
    return 'À planifier';
  };

  const getPriorityTextColor = (priority: number) => {
    if (priority >= 8) return 'text-destructive';
    if (priority >= 5) return 'text-warning';
    return 'text-info';
  };

  return (
    <div className={cn(
      "border-l-4 p-3 motion-safe:animate-fade-in",
      getPriorityColor(issue.priority)
    )}>
      <h5 className={cn(
        "font-semibold",
        getPriorityTextColor(issue.priority)
      )}>
        {getPriorityLabel(issue.priority)}
      </h5>
      <p className="text-sm">{issue.title}</p>
    </div>
  );
});