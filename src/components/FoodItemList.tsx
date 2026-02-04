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
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Detected foods</p>
          <h3 className="font-display font-semibold">Detected Foods</h3>
        </div>
        <span className="glass-pill">
          {items.length} ITEM{items.length > 1 ? "S" : ""}
        </span>
      </div>
      <ul className="mt-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
          >
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.estimatedPortion}
              </p>
            </div>
            <p className="text-sm font-semibold ml-4 text-white/90">
              {item.calories} cal
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
