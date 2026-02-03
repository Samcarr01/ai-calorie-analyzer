"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/ErrorFallback";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error("Application error:", error);
  }, [error]);

  return <ErrorFallback error={error} resetErrorBoundary={reset} />;
}
