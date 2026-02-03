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
      try {
        setData(JSON.parse(storedResult));
        setImageData(storedImage);
      } catch (error) {
        console.error("Failed to parse stored result:", error);
      }
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
    <main className="min-h-screen p-4 pb-24 bg-background">
      {/* Header */}
      <header className="flex items-center gap-2 mb-6 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Nutrition Results</h1>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Image thumbnail */}
        {imageData && (
          <Card className="overflow-hidden">
            <img
              src={`data:image/jpeg;base64,${imageData}`}
              alt="Analyzed meal"
              className="w-full h-48 object-cover"
            />
          </Card>
        )}

        {/* Total calories */}
        <div className="text-center">
          <AnimatedNumber
            value={data.totalCalories}
            className="text-5xl font-bold"
          />
          <p className="text-muted-foreground mt-1">calories</p>
        </div>

        {/* Macros */}
        <NutritionCard macros={data.macros} />

        {/* Confidence */}
        <ConfidenceIndicator level={data.confidence} />

        {/* Food items */}
        <FoodItemList items={data.foodItems} />

        {/* Notes */}
        {data.notes && (
          <Card className="p-4 bg-muted">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Note:</span> {data.notes}
            </p>
          </Card>
        )}
      </div>

      {/* Action button - fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-2xl mx-auto">
          <Button
            className="w-full h-12"
            onClick={handleAnalyzeAnother}
            size="lg"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Analyze Another Meal
          </Button>
        </div>
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
    const duration = 1000; // 1 second
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
