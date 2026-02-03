"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/CameraCapture";
import { AnalyzingState } from "@/components/AnalyzingState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { AnalyzeResponse } from "@/types/nutrition";

export default function HomePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = async (imageData: string, mimeType: string, context?: string) => {
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
        // Store result and navigate
        sessionStorage.setItem("analysisResult", JSON.stringify(result.data));
        sessionStorage.setItem("capturedImage", imageData);
        router.push("/results");
      } else {
        setError(
          result.error || "Analysis failed. Please try again with a different photo."
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

  // Show analyzing state when processing
  if (isAnalyzing && capturedImage) {
    return <AnalyzingState imageData={capturedImage} />;
  }

  // Main home page UI
  return (
    <main className="min-h-screen flex flex-col p-4 bg-background">
      {/* Header */}
      <header className="text-center mb-8 mt-8">
        <h1 className="text-3xl font-bold mb-2">AI Calorie Analyzer</h1>
        <p className="text-muted-foreground">
          Take a photo of your meal to get instant nutrition estimates
        </p>
      </header>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Camera capture component */}
      <div className="flex-1 flex items-start justify-center">
        <CameraCapture
          onCapture={handleCapture}
          onError={handleError}
          disabled={isAnalyzing}
        />
      </div>

      {/* Footer info */}
      <footer className="text-center mt-8 mb-4">
        <p className="text-xs text-muted-foreground">
          Estimates are based on AI analysis and may not be 100% accurate
        </p>
      </footer>
    </main>
  );
}
