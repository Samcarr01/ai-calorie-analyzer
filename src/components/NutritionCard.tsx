"use client";

import { Card } from "@/components/ui/card";
import type { Macros } from "@/types/nutrition";

interface NutritionCardProps {
  macros: Macros;
}

export function NutritionCard({ macros }: NutritionCardProps) {
  const items = [
    {
      label: "Protein",
      value: macros.protein,
      unit: "g",
      color: "bg-blue-500",
    },
    {
      label: "Carbs",
      value: macros.carbohydrates,
      unit: "g",
      color: "bg-green-500",
    },
    {
      label: "Fat",
      value: macros.fat,
      unit: "g",
      color: "bg-yellow-500",
    },
  ];

  // Add fiber if present
  if (macros.fiber !== undefined && macros.fiber !== null) {
    items.push({
      label: "Fiber",
      value: macros.fiber,
      unit: "g",
      color: "bg-purple-500",
    });
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.slice(0, 3).map((item) => (
        <Card key={item.label} className="p-4 text-center">
          <div className={`w-2 h-2 rounded-full ${item.color} mx-auto mb-2`} />
          <p className="text-2xl font-semibold">
            {item.value}
            <span className="text-sm font-normal text-muted-foreground ml-0.5">
              {item.unit}
            </span>
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            {item.label}
          </p>
        </Card>
      ))}
      {/* Show fiber in full width row if present */}
      {items.length > 3 && (
        <Card className="col-span-3 p-4 text-center">
          <div className={`w-2 h-2 rounded-full ${items[3].color} mx-auto mb-2`} />
          <p className="text-2xl font-semibold">
            {items[3].value}
            <span className="text-sm font-normal text-muted-foreground ml-0.5">
              {items[3].unit}
            </span>
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            {items[3].label}
          </p>
        </Card>
      )}
    </div>
  );
}
