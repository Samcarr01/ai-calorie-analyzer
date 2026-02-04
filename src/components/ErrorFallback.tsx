"use client";

import { CtaButton } from "@/components/CtaButton";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <main className="page-shell flex items-center justify-center">
      <Card className="max-w-md p-6 text-center space-y-4 animate-fade-up">
        <AlertTriangle className="h-12 w-12 text-amber-300 mx-auto" />
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">
          We encountered an unexpected error. Please try again.
        </p>
        {error && process.env.NODE_ENV === "development" && (
          <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            {error.message}
          </p>
        )}
        <CtaButton
          onClick={resetErrorBoundary || (() => window.location.reload())}
          className="cta-button--lg w-full"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </CtaButton>
      </Card>
    </main>
  );
}
