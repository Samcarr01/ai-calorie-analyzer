"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/CameraCapture";
import { AnalyzingState } from "@/components/AnalyzingState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import type { AnalyzeResponse } from "@/types/nutrition";
import { checkAccess } from "@/lib/access";

export default function AppPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAccess().then((authorized) => {
      if (!authorized) {
        router.replace("/");
        return;
      }
      setIsAuthorized(true);
      setIsChecking(false);
    });
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
        // Handle unauthorized error
        if (result.code === "UNAUTHORIZED") {
          router.replace("/");
          return;
        }
        setError(result.error || "Analysis failed. Please try again.");
        setIsAnalyzing(false);
        setCapturedImage(null);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Connection failed. Check your internet and try again.");
      setIsAnalyzing(false);
      setCapturedImage(null);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (isChecking || !isAuthorized) {
    return (
      <main className="page-shell flex items-center justify-center">
        <div className="glass-panel px-6 py-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-300 border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </main>
    );
  }

  if (isAnalyzing && capturedImage) {
    return <AnalyzingState imageData={capturedImage} />;
  }

  return (
    <main className="page-shell pt-6 pb-6 md:pt-12 md:pb-24 px-4 md:px-5 overflow-hidden md:overflow-visible flex flex-col min-h-[100svh] md:min-h-screen">
      <div className="mx-auto w-full max-w-5xl flex flex-col gap-4 md:gap-6 flex-1 min-h-0">
        <header className="flex md:hidden items-center justify-between gap-3 animate-fade-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Scanner
            </p>
            <p className="font-display text-base font-semibold">Scan your meal</p>
          </div>
          <span className="glass-pill">Live</span>
        </header>

        <header className="hidden md:flex items-center justify-between gap-4 animate-fade-up">
          <div className="space-y-2">
            <span className="glass-pill">Scanner</span>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-glow">
              Scan your meal
            </h1>
            <p className="text-sm text-muted-foreground">
              Capture a clear frame and let the analysis do the rest.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </header>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="animate-fade-up">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera */}
        <div className="animate-fade-up delay-1 flex-1 min-h-0">
          <CameraCapture
            onCapture={handleCapture}
            onError={handleError}
            disabled={isAnalyzing}
          />
        </div>

        {/* Footer */}
        <div className="hidden md:block glass-panel px-4 py-3 text-xs text-muted-foreground text-center">
          Add a quick note for sauces, toppings, or mixed dishes to improve accuracy.
        </div>
      </div>
    </main>
  );
}
