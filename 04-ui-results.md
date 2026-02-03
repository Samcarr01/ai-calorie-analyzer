# Prompt 04: Results Display UI

## 🧠 CONTEXT

Reference: `Claude-ui.md` → Results Display

This prompt implements the nutrition results page that displays calorie counts, macros, detected foods, and confidence indicators.

**Prerequisites:** Prompts 01-03 completed.

---

## 📋 TASK

Generate a complete results display implementation that:

1. Retrieves analysis data from sessionStorage
2. Displays total calories prominently
3. Shows macro breakdown with visual indicators
4. Lists detected food items with portions
5. Displays confidence level with colour coding
6. Provides "Analyze Another" action

---

## ⚠️ CONSTRAINTS

1. **Must** read data from sessionStorage on mount
2. **Must** redirect to home if no data found
3. **Must** display calories as largest element
4. **Must** show protein, carbs, fat in visual cards
5. **Must** colour-code confidence (green/yellow/red)
6. **Must** animate numbers on initial render
7. **Must** clear sessionStorage on "Analyze Another"
8. **Must** use shadcn/ui components
9. *Should* show thumbnail of captured image
10. *Should* display notes if present in response

---

## 📝 OUTPUT FORMAT

### File: `src/app/results/page.tsx`

Complete results page:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NutritionCard } from "@/components/NutritionCard";
import { FoodItemList } from "@/components/FoodItemList";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { MealAnalysis } from "@/types/nutrition";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<MealAnalysis | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve from sessionStorage
    const storedResult = sessionStorage.getItem("analysisResult");
    const storedImage = sessionStorage.getItem("capturedImage");

    if (storedResult) {
      setData(JSON.parse(storedResult));
      setImageData(storedImage);
    }
    setIsLoading(false);
  }, []);

  // Redirect if no data
  useEffect(() => {
    if (!isLoading && !data) {
      router.replace("/");
    }
  }, [isLoading, data, router]);

  const handleAnalyzeAnother = () => {
    sessionStorage.removeItem("analysisResult");
    sessionStorage.removeItem("capturedImage");
    router.push("/");
  };

  if (isLoading || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 pb-24">
      <header className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Nutrition Results</h1>
      </header>

      {/* Image thumbnail */}
      {imageData && (
        <Card className="mb-6 overflow-hidden">
          <img
            src={`data:image/jpeg;base64,${imageData}`}
            alt="Analyzed meal"
            className="w-full h-48 object-cover"
          />
        </Card>
      )}

      {/* Total calories */}
      <div className="text-center mb-8">
        <AnimatedNumber
          value={data.totalCalories}
          className="text-5xl font-bold"
        />
        <p className="text-muted-foreground">calories</p>
      </div>

      {/* Macros */}
      <NutritionCard macros={data.macros} />

      {/* Confidence */}
      <div className="my-6">
        <ConfidenceIndicator level={data.confidence} />
      </div>

      {/* Food items */}
      <FoodItemList items={data.foodItems} />

      {/* Notes */}
      {data.notes && (
        <Card className="mt-6 p-4 bg-muted">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Note:</span> {data.notes}
          </p>
        </Card>
      )}

      {/* Action button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button
          className="w-full h-12"
          onClick={handleAnalyzeAnother}
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Analyze Another Meal
        </Button>
      </div>
    </main>
  );
}

// Animated number component
function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span className={className}>{displayValue}</span>;
}
```

### File: `src/components/NutritionCard.tsx`

Macro display component:

```typescript
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
  if (macros.fiber !== undefined) {
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
            <span className="text-sm font-normal text-muted-foreground">
              {item.unit}
            </span>
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {item.label}
          </p>
        </Card>
      ))}
    </div>
  );
}
```

### File: `src/components/FoodItemList.tsx`

Detected foods list:

```typescript
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
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.estimatedPortion}
              </p>
            </div>
            <p className="text-sm font-medium">
              {item.calories} cal
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
```

### File: `src/components/ConfidenceIndicator.tsx`

Confidence level display:

```typescript
"use client";

import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  level: "low" | "medium" | "high";
}

const config = {
  low: {
    dots: 1,
    color: "bg-red-500",
    textColor: "text-red-600",
    label: "Rough estimate",
    description: "Image quality or food complexity affected accuracy",
  },
  medium: {
    dots: 3,
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    label: "Good estimate",
    description: "Reasonable confidence in the analysis",
  },
  high: {
    dots: 5,
    color: "bg-green-500",
    textColor: "text-green-600",
    label: "Confident estimate",
    description: "Clear image with recognizable foods",
  },
};

export function ConfidenceIndicator({ level }: ConfidenceIndicatorProps) {
  const { dots, color, textColor, label, description } = config[level];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
      <div>
        <p className={cn("font-medium", textColor)}>{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              i < dots ? color : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 STYLING NOTES

### Calorie Display

- Font size: `text-5xl` (48px)
- Weight: `font-bold`
- Animation: Count up from 0 over 1 second

### Macro Cards

- Equal width columns: `grid-cols-3`
- Colour dots to differentiate macros
- Consistent padding and spacing

### Confidence Indicator

- Full-width with background
- Dot indicators (5 total, filled based on level)
- Descriptive text for context

---

## 🧪 TEST CASES

### Data Present

1. Complete analysis flow from camera
2. Results page should display all data
3. Calories should animate

### Data Missing

1. Navigate directly to `/results`
2. Should redirect to home page

### Analyze Another

1. Click "Analyze Another" button
2. Should clear sessionStorage
3. Should navigate to home

---

## ✅ VERIFICATION

- [ ] Results display correctly from sessionStorage
- [ ] Redirect works when no data
- [ ] Calorie animation plays on load
- [ ] Macros display in card grid
- [ ] Confidence shows correct colour
- [ ] Food items list renders
- [ ] "Analyze Another" clears data and returns home

---

## 🔗 NEXT PROMPT

After completing this page, proceed to `05-deploy.md` to configure Vercel deployment.
