"use client";

import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  level: "low" | "medium" | "high";
}

const config = {
  low: {
    dots: 1,
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    label: "Rough estimate",
    description: "Image quality or food complexity affected accuracy",
  },
  medium: {
    dots: 3,
    color: "bg-yellow-500",
    textColor: "text-yellow-600 dark:text-yellow-400",
    label: "Good estimate",
    description: "Reasonable confidence in the analysis",
  },
  high: {
    dots: 5,
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
    label: "Confident estimate",
    description: "Clear image with recognizable foods",
  },
};

export function ConfidenceIndicator({ level }: ConfidenceIndicatorProps) {
  const { dots, color, textColor, label, description } = config[level];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
      <div className="flex-1">
        <p className={cn("font-medium", textColor)}>{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-1 ml-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors",
              i < dots ? color : "bg-gray-300 dark:bg-gray-600"
            )}
          />
        ))}
      </div>
    </div>
  );
}
