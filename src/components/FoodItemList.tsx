"use client";

import { Card } from "@/components/ui/card";
import type { FoodItem } from "@/types/nutrition";

interface FoodItemListProps {
  items: FoodItem[];
}

export function FoodItemList({ items }: FoodItemListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <span className="text-lg">📋</span>
        Detected Foods
      </h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.estimatedPortion}
              </p>
            </div>
            <p className="text-sm font-medium ml-4">
              {item.calories} cal
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
