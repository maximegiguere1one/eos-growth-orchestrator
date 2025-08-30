import { ReactNode } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScreenshotFrameProps {
  children: ReactNode;
  ratio?: number;
  className?: string;
  screenshotMode?: boolean;
}

export function ScreenshotFrame({ 
  children, 
  ratio = 9/16,
  className,
  screenshotMode = false 
}: ScreenshotFrameProps) {
  return (
    <Card className={cn(
      "overflow-hidden bg-gradient-primary/5",
      screenshotMode && "border-primary/20",
      className
    )}>
      <AspectRatio ratio={ratio}>
        <div className="h-full flex flex-col justify-center p-4">
          {children}
        </div>
      </AspectRatio>
    </Card>
  );
}