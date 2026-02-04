"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Lock,
  Camera,
  Zap,
  Shield,
  Instagram,
  Loader2,
  Sparkles,
} from "lucide-react";
import { checkAccess, validateAndSetAccess } from "@/lib/access";

export default function LandingPage() {
  const router = useRouter();
  const [showAccess, setShowAccess] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAccess().then((authorized) => {
      setIsAuthorized(authorized);
      setIsLoading(false);
    });
  }, []);

  const handleCta = () => {
    if (isAuthorized) {
      router.push("/app");
      return;
    }
    setShowAccess(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setCodeError("");

    const result = await validateAndSetAccess(code);

    if (result.success) {
      setIsAuthorized(true);
      setShowAccess(false);
      setCode("");
      router.push("/app");
    } else {
      setCodeError(result.error || "Invalid code");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="page-shell">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-center">
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="glass-panel p-3">
                <Camera className="h-7 w-7 text-amber-200" />
              </div>
              <span className="glass-pill">PRIVATE ACCESS</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-glow">
              Calorie AI
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Snap a photo of your meal and get a clean calorie + macro estimate in seconds.
              Built for fast, no‑friction check‑ins with a confidence score so you know when to
              refine.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button
                size="lg"
                onClick={handleCta}
                disabled={isLoading}
                className="h-14 px-10 text-base shine"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isAuthorized ? (
                  "Open Scanner"
                ) : (
                  "Enter Access Code"
                )}
              </Button>
              {!isAuthorized && !isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Instagram className="h-4 w-4" />
                  <span>DM @samcarr142 on Instagram for access</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-amber-200/70" />
              <span>No account needed · Images never stored</span>
            </div>
          </div>

          <Card className="p-6 md:p-7 space-y-5 animate-fade-up delay-1">
            <div className="flex items-center justify-between">
              <span className="glass-pill">PREVIEW</span>
              <Sparkles className="h-5 w-5 text-amber-200" />
            </div>
            <div className="space-y-3">
              <div className="glass-panel p-4">
                <p className="text-xs text-muted-foreground">Instant output</p>
                <p className="text-sm font-semibold">Calories + macros in seconds</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Optimized for quick scans without the clutter.
                </p>
              </div>
              <div className="glass-panel p-4">
                <p className="text-xs text-muted-foreground">Confidence score</p>
                <p className="text-sm font-semibold">Know when to refine</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add context when a dish is mixed or hidden.
                </p>
              </div>
              <div className="glass-panel p-4">
                <p className="text-xs text-muted-foreground">Built for mobile</p>
                <p className="text-sm font-semibold">
                  Glass UI that feels premium and fast
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3 animate-fade-up delay-1">
          <Card className="p-5 text-left hover-lift">
            <Zap className="h-5 w-5 text-amber-200" />
            <p className="text-sm font-semibold mt-3">Fast analysis</p>
            <p className="text-xs text-muted-foreground mt-2">
              Get calories, macros, and confidence in a few seconds.
            </p>
          </Card>
          <Card className="p-5 text-left hover-lift">
            <Shield className="h-5 w-5 text-amber-200" />
            <p className="text-sm font-semibold mt-3">Private by default</p>
            <p className="text-xs text-muted-foreground mt-2">
              No accounts or storage. Your images stay on your device.
            </p>
          </Card>
          <Card className="p-5 text-left hover-lift">
            <Sparkles className="h-5 w-5 text-amber-200" />
            <p className="text-sm font-semibold mt-3">Refine anytime</p>
            <p className="text-xs text-muted-foreground mt-2">
              Add a quick note to improve accuracy on complex meals.
            </p>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr] animate-fade-up delay-2">
          <div className="glass-card p-6 md:p-8 text-left space-y-4">
            <h2 className="font-display text-xl font-semibold">How it works</h2>
            <div className="grid gap-3 md:grid-cols-3 text-sm text-muted-foreground">
              <div className="glass-panel p-4">
                1. Capture a clear photo with the whole plate visible.
              </div>
              <div className="glass-panel p-4">
                2. We estimate calories and macros with confidence scoring.
              </div>
              <div className="glass-panel p-4">
                3. Add a short note if anything is hidden or mixed.
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 space-y-3 text-left">
            <p className="text-sm font-semibold">Good to know</p>
            <p className="text-xs text-muted-foreground">
              Best results come from bright lighting and a steady shot. Portions are estimates,
              so use the refine step when needed.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-4 w-4 text-amber-200/70" />
              <span>Access‑code only while in private beta.</span>
            </div>
          </div>
        </section>
      </div>

      {/* Access Code Modal */}
      {showAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <Card className="w-full max-w-sm p-6 space-y-5 animate-fade-up">
            <div className="text-center space-y-2">
              <div className="glass-panel p-3 w-fit mx-auto">
                <Lock className="h-5 w-5 text-amber-200" />
              </div>
              <h2 className="font-display text-lg font-semibold">Enter access code</h2>
              <p className="text-xs text-muted-foreground">
                DM <span className="text-amber-200">@samcarr142</span> on Instagram to get the code
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setCodeError("");
                  }}
                  placeholder="Enter code"
                  disabled={isSubmitting}
                  className="glass-input text-center text-lg tracking-widest disabled:opacity-50"
                  autoFocus
                />
                {codeError && (
                  <p className="text-xs text-destructive text-center mt-2">{codeError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Unlock"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowAccess(false);
                    setCode("");
                    setCodeError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>

            <a
              href="https://instagram.com/samcarr142"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors"
            >
              <Instagram className="h-3 w-3" />
              <span>Get code from @samcarr142</span>
            </a>
          </Card>
        </div>
      )}
    </main>
  );
}
