"use client";

import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  level: "low" | "medium" | "high";
}

const config = {
  low: {
    dots: 1,
    color: "bg-rose-400",
    textColor: "text-rose-300",
    label: "Rough estimate",
    description: "Image quality or food complexity affected accuracy",
  },
  medium: {
    dots: 3,
    color: "bg-amber-300",
    textColor: "text-amber-200",
    label: "Good estimate",
    description: "Reasonable confidence in the analysis",
  },
  high: {
    dots: 5,
    color: "bg-yellow-200",
    textColor: "text-yellow-200",
    label: "Confident estimate",
    description: "Clear image with recognizable foods",
  },
};

export function ConfidenceIndicator({ level }: ConfidenceIndicatorProps) {
  const { dots, color, textColor, label, description } = config[level];

  return (
    <div className="glass-panel flex items-center justify-between p-4">
      <div className="flex-1">
        <p className={cn("font-semibold", textColor)}>{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-1.5 ml-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              i < dots ? color : "bg-white/15"
            )}
          />
        ))}
      </div>
    </div>
  );
}
