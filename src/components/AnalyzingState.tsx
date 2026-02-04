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
        <div className="aspect-square relative rounded-3xl overflow-hidden analyze-frame">
          <img
            src={`data:image/jpeg;base64,${imageData}`}
            alt="Captured meal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 analyze-sweep" />
          <div className="absolute inset-0 analyze-shimmer" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-6 flex justify-center">
            <div className="analyze-loader-wrapper" aria-label="Analyzing">
              {"Analyzing".split("").map((char, index) => (
                <span key={`${char}-${index}`} className="analyze-loader-letter">
                  {char}
                </span>
              ))}
              <div className="analyze-loader" />
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-4 text-center">
          <p className="text-xs text-muted-foreground">{message}</p>
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">
            Usually takes 2-3 seconds
          </p>
        </div>
      </Card>
    </main>
  );
}
