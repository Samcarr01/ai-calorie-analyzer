"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html className="dark">
      <body className="antialiased">
        <ErrorFallback error={error} resetErrorBoundary={reset} />
      </body>
    </html>
  );
}
