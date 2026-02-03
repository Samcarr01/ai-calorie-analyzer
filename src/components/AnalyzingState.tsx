"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface AnalyzingStateProps {
  imageData: string;
}

export function AnalyzingState({ imageData }: AnalyzingStateProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Analyzing your meal...");

  useEffect(() => {
    // Simulated progress for UX (actual API call may complete at any time)
    const messages = [
      "Analyzing your meal...",
      "Identifying foods...",
      "Calculating nutrition...",
      "Almost done...",
    ];

    let currentIndex = 0;
    let progressValue = 0;

    const interval = setInterval(() => {
      // Update progress (stops at 90% to wait for actual response)
      progressValue = Math.min(progressValue + 15, 90);
      setProgress(progressValue);

      // Cycle through messages
      currentIndex = (currentIndex + 1) % messages.length;
      setMessage(messages[currentIndex]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6 space-y-6">
        {/* Image preview with overlay */}
        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
          <img
            src={`data:image/jpeg;base64,${imageData}`}
            alt="Captured meal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-3 text-center">
          <p className="font-medium text-lg">{message}</p>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Usually takes 2-3 seconds
          </p>
        </div>
      </Card>
    </main>
  );
}
