"use client";

import type { Macros } from "@/types/nutrition";

interface NutritionCardProps {
  macros: Macros;
}

interface MacroItem {
  label: string;
  value: number;
  unit: string;
  color: string;
}

export function NutritionCard({ macros }: NutritionCardProps) {
  // Primary macros - always shown
  const primaryMacros: MacroItem[] = [
    {
      label: "Protein",
      value: macros.protein,
      unit: "g",
      color: "bg-cyan-300",
    },
    {
      label: "Carbs",
      value: macros.carbohydrates,
      unit: "g",
      color: "bg-emerald-300",
    },
    {
      label: "Fat",
      value: macros.fat,
      unit: "g",
      color: "bg-amber-200",
    },
  ];

  // Secondary details - shown if available
  const secondaryMacros: MacroItem[] = [];

  if (macros.sugar !== undefined && macros.sugar !== null) {
    secondaryMacros.push({
      label: "Sugar",
      value: macros.sugar,
      unit: "g",
      color: "bg-rose-300",
    });
  }

  if (macros.fiber !== undefined && macros.fiber !== null) {
    secondaryMacros.push({
      label: "Fiber",
      value: macros.fiber,
      unit: "g",
      color: "bg-violet-300",
    });
  }

  return (
    <div className="space-y-3">
      {/* Primary macros - 3 column grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {primaryMacros.map((item) => (
          <div key={item.label} className="glass-panel p-4 text-center">
            <div className={`w-2 h-2 rounded-full ${item.color} mx-auto mb-2`} />
            <p className="text-2xl font-semibold text-white/90">
              {item.value}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">
                {item.unit}
              </span>
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Secondary macros - 2 column grid if present */}
      {secondaryMacros.length > 0 && (
        <div
          className={`grid gap-3 ${
            secondaryMacros.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {secondaryMacros.map((item) => (
            <div key={item.label} className="glass-panel p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <p className="text-lg font-semibold text-white/90">
                  {item.value}
                  <span className="text-sm font-normal text-muted-foreground ml-0.5">
                    {item.unit}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
