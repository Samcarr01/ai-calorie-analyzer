"use client";

import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md p-6 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          We encountered an unexpected error. Please try again.
        </p>
        {error && process.env.NODE_ENV === "development" && (
          <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            {error.message}
          </p>
        )}
        <Button
          onClick={resetErrorBoundary || (() => window.location.reload())}
          size="lg"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </Card>
    </main>
  );
}
