"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/CameraCapture";
import { AnalyzingState } from "@/components/AnalyzingState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { AnalyzeResponse } from "@/types/nutrition";
import { hasAccess } from "@/lib/access";

export default function AppPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!hasAccess()) {
      router.replace("/");
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  const handleCapture = async (
    imageData: string,
    mimeType: string,
    context?: string
  ) => {
    setError(null);
    setCapturedImage(imageData);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, mimeType, context }),
      });

      const result: AnalyzeResponse = await response.json();

      if (result.success && result.data) {
        sessionStorage.setItem("analysisResult", JSON.stringify(result.data));
        sessionStorage.setItem("capturedImage", imageData);
        router.push("/results");
      } else {
        setError(
          result.error ||
            "Analysis failed. Please try again with a different photo."
        );
        setIsAnalyzing(false);
        setCapturedImage(null);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
      setIsAnalyzing(false);
      setCapturedImage(null);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (!isAuthorized) {
    return (
      <main className="page-shell flex items-center justify-center">
        <div className="glass-panel px-6 py-5 text-sm text-muted-foreground">
          Checking access...
        </div>
      </main>
    );
  }

  if (isAnalyzing && capturedImage) {
    return <AnalyzingState imageData={capturedImage} />;
  }

  return (
    <main className="page-shell">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Scanner</p>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-glow">
                Capture your meal
              </h1>
            </div>
            <span className="glass-pill text-[10px]">PRIVATE</span>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl">
            Hold steady for a clean shot. Add a short note if the meal is
            complex or has hidden ingredients.
          </p>
        </header>

        {error && (
          <Alert
            variant="destructive"
            className="mx-auto w-full max-w-2xl animate-fade-up delay-1"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start animate-fade-up delay-1">
          <div className="flex items-start justify-center">
            <CameraCapture
              onCapture={handleCapture}
              onError={handleError}
              disabled={isAnalyzing}
            />
          </div>

          <aside className="space-y-4">
            <Card className="p-5 space-y-3 hover-lift">
              <p className="text-sm font-semibold">Capture tips</p>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>Keep the whole plate visible.</li>
                <li>Bright light improves accuracy.</li>
                <li>Add a note for mixed dishes or drinks.</li>
              </ul>
            </Card>
            <Card className="p-5 space-y-3 hover-lift">
              <p className="text-sm font-semibold">What you get</p>
              <div className="grid gap-3">
                <div className="glass-panel p-3 text-xs text-muted-foreground">
                  Calories + macro breakdown
                </div>
                <div className="glass-panel p-3 text-xs text-muted-foreground">
                  Confidence level + notes
                </div>
                <div className="glass-panel p-3 text-xs text-muted-foreground">
                  Optional refine pass
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <footer className="text-center text-xs text-muted-foreground">
          Estimates are based on AI analysis and may not be 100% accurate.
        </footer>
      </div>
    </main>
  );
}
