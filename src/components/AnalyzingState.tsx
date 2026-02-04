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
    <main className="page-shell flex items-center justify-center">
      <Card className="w-full max-w-md p-6 space-y-6 animate-fade-up">
        {/* Image preview with overlay */}
        <div className="aspect-square relative rounded-2xl overflow-hidden">
          <img
            src={`data:image/jpeg;base64,${imageData}`}
            alt="Captured meal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-2 border-white/25" />
              <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-amber-200 animate-spin" />
            </div>
          </div>
          <div className="scan-line" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Progress section */}
        <div className="space-y-3 text-center">
          <p className="font-display font-semibold text-lg">
            {message}
            <span className="inline-flex gap-1 ml-2 text-amber-200/70">
              <span className="animate-bounce">·</span>
              <span className="animate-bounce [animation-delay:120ms]">·</span>
              <span className="animate-bounce [animation-delay:240ms]">·</span>
            </span>
          </p>
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">
            Usually takes 2-3 seconds
          </p>
        </div>
      </Card>
    </main>
  );
}
