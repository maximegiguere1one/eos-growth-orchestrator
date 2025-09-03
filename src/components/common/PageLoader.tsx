import { Skeleton } from "@/components/ui/skeleton";

interface PageLoaderProps {
  className?: string;
  variant?: 'minimal' | 'dashboard' | 'full';
}

export function PageLoader({ className, variant = 'dashboard' }: PageLoaderProps) {
  if (variant === 'minimal') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className || ''}`}>
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-background ${className || ''}`}>
        <div className="space-y-6 w-full max-w-4xl px-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Dashboard variant (default)
  return (
    <div className={`space-y-6 p-6 ${className || ''}`} role="status" aria-label="Loading page content">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}