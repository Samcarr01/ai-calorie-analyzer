"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NutritionCard } from "@/components/NutritionCard";
import { FoodItemList } from "@/components/FoodItemList";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/CtaButton";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, RefreshCw, Loader2 } from "lucide-react";
import type { MealAnalysis, AnalyzeResponse } from "@/types/nutrition";
import { checkAccess } from "@/lib/access";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<MealAnalysis | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showRefine, setShowRefine] = useState(false);
  const [refineContext, setRefineContext] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  useEffect(() => {
    // Check auth and load data
    const init = async () => {
      const authorized = await checkAccess();
      if (!authorized) {
        router.replace("/");
        return;
      }
      setIsAuthorized(true);

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
    };

    init();
  }, [router]);

  // Redirect if no data
  useEffect(() => {
    if (!isLoading && isAuthorized && !data) {
      router.replace("/app");
    }
  }, [isLoading, isAuthorized, data, router]);

  const handleAnalyzeAnother = () => {
    sessionStorage.removeItem("analysisResult");
    sessionStorage.removeItem("capturedImage");
    router.push("/app");
  };

  const handleRefine = async () => {
    if (!imageData || !refineContext.trim()) return;

    setIsRefining(true);
    setRefineError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageData,
          mimeType: "image/jpeg",
          context: refineContext.trim(),
        }),
      });

      const result: AnalyzeResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        sessionStorage.setItem("analysisResult", JSON.stringify(result.data));
        setShowRefine(false);
        setRefineContext("");
      } else {
        setRefineError(result.error || "Failed to refine analysis");
      }
    } catch (err) {
      setRefineError("Network error. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  if (isLoading || !data || !isAuthorized) {
    return (
      <main className="page-shell flex items-center justify-center">
        <div className="glass-panel px-6 py-5 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-300 border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading results</span>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell pb-28">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between gap-4 animate-fade-up">
          <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
            <div>
              <span className="glass-pill">Summary</span>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-glow">
                Your meal breakdown
              </h1>
            </div>
          </div>
          <span className="glass-pill">Nutrition</span>
        </header>

        {imageData && (
          <Card className="p-3 animate-fade-up delay-1">
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src={`data:image/jpeg;base64,${imageData}`}
                alt="Analyzed meal"
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 glass-pill text-[10px]">
                CAPTURED
              </div>
              <div className="absolute bottom-4 left-4 glass-panel px-4 py-3">
                <p className="text-xs text-muted-foreground">Total calories</p>
                <AnimatedNumber
                  value={data.totalCalories}
                  className="font-display text-3xl font-semibold text-white/90"
                />
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 space-y-4 animate-fade-up delay-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Macros</h2>
            <div className="glass-pill">Estimate</div>
          </div>
          <NutritionCard macros={data.macros} />
        </Card>

        <div className="space-y-5 animate-fade-up delay-2">
          <ConfidenceIndicator level={data.confidence} />

          {!showRefine ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowRefine(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Not accurate? Add details to refine
            </Button>
          ) : (
            <Card className="p-4 space-y-3">
              <p className="text-sm font-medium">What is this food/drink?</p>
              <input
                type="text"
                placeholder="e.g., 'milk tea with boba and brown sugar'"
                value={refineContext}
                onChange={(e) => setRefineContext(e.target.value)}
                disabled={isRefining}
                className="glass-input"
                maxLength={500}
                autoFocus
              />
              {refineError && (
                <p className="text-sm text-destructive">{refineError}</p>
              )}
              <div className="flex gap-2">
                <CtaButton
                  onClick={handleRefine}
                  disabled={isRefining || !refineContext.trim()}
                  className="cta-button--sm flex-1"
                >
                  {isRefining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Re-analyze"
                  )}
                </CtaButton>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRefine(false);
                    setRefineContext("");
                    setRefineError(null);
                  }}
                  disabled={isRefining}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          <FoodItemList items={data.foodItems} />

          {data.notes && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Note:</span> {data.notes}
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="mx-auto max-w-5xl glass-panel p-3">
          <CtaButton
            onClick={handleAnalyzeAnother}
            className="cta-button--lg w-full"
          >
            <RotateCcw className="h-5 w-5" />
            Analyze Another Meal
          </CtaButton>
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
