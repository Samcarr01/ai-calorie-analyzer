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
        <h3 className="font-semibold">Detected Foods</h3>
        <span className="glass-pill text-[10px] tracking-[0.25em]">
          {items.length} ITEM{items.length > 1 ? "S" : ""}
        </span>
      </div>
      <ul className="space-y-3 mt-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="glass-panel flex items-center justify-between px-4 py-3"
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
