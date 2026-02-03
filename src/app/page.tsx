"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, ShieldCheck, ScanLine, Sparkles, ArrowRight } from "lucide-react";
import { hasAccess, setAccess, validateAccessCode } from "@/lib/access";

export default function LandingPage() {
  const router = useRouter();
  const [showAccess, setShowAccess] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setIsAuthorized(hasAccess());
  }, []);

  const handleCta = () => {
    if (hasAccess()) {
      router.push("/app");
      return;
    }
    setShowAccess(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateAccessCode(code)) {
      setAccess(true);
      setIsAuthorized(true);
      setShowAccess(false);
      setCode("");
      setCodeError("");
      router.push("/app");
      return;
    }
    setCodeError("Incorrect access code. Try again.");
  };

  return (
    <main className="page-shell">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <nav className="flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="glass-panel px-3 py-2 text-sm font-semibold">
              CA
            </div>
            <div>
              <p className="text-sm font-semibold">Calorie AI</p>
              <p className="text-xs text-muted-foreground">
                Private meal scanner
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleCta}>
            {isAuthorized ? "Open App" : "Enter Code"}
          </Button>
        </nav>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center animate-fade-up delay-1">
          <div className="space-y-6">
            <span className="glass-pill">PRIVATE BETA</span>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-glow">
              Clean nutrition insights from a single photo.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Snap, refine, and move on. Calorie AI keeps the flow simple while
              giving you a confidence‑scored breakdown.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handleCta} className="shine">
                Unlock Access
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={handleCta}>
                {isAuthorized ? "Go to Scanner" : "Use Access Code"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="glass-panel px-3 py-2">No account required</span>
              <span className="glass-panel px-3 py-2">Private by default</span>
              <span className="glass-panel px-3 py-2">Mobile first</span>
            </div>
          </div>

          <Card className="p-6 space-y-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Live preview</p>
                <h2 className="text-xl font-semibold">Scanner preview</h2>
              </div>
              <span className="glass-pill text-[10px]">READY</span>
            </div>
            <div className="glass-panel p-4 space-y-3 hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Calories</span>
                <span className="text-sm font-semibold text-white/90">
                  520 kcal
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Protein 32g</span>
                <span>Carbs 48g</span>
                <span>Fat 18g</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Private by default",
                  description: "No accounts or storage needed.",
                  icon: ShieldCheck,
                },
                {
                  title: "Instant analysis",
                  description: "Calories and macros in seconds.",
                  icon: ScanLine,
                },
                {
                  title: "Refine results",
                  description: "Add context for better accuracy.",
                  icon: Sparkles,
                },
              ].map((feature) => (
                <div key={feature.title} className="glass-panel p-4 hover-lift">
                  <feature.icon className="h-4 w-4 text-cyan-200" />
                  <p className="text-sm font-semibold mt-3">{feature.title}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="glass-card p-6 md:p-8 flex flex-col gap-6 animate-fade-up delay-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Access</p>
              <h2 className="text-2xl font-semibold">Enter with a code</h2>
            </div>
            <div className="glass-pill text-[10px]">
              {isAuthorized ? "GRANTED" : "LOCKED"}
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Share the access code with friends. Everyone else stays locked out
            of the camera and results.
          </p>
          <Button size="lg" onClick={handleCta}>
            {isAuthorized ? "Open App" : "Enter Access Code"}
          </Button>
        </section>

        <footer className="text-center text-xs text-muted-foreground">
          Built for mobile. Best experience on iPhone or Android.
        </footer>
      </div>

      {showAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="glass-panel p-2">
                <Lock className="h-4 w-4 text-cyan-200" />
              </div>
              <div>
                <p className="text-sm font-semibold">Enter access code</p>
                <p className="text-xs text-muted-foreground">
                  This app is locked for friends only.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeError("");
                }}
                placeholder="Access code"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30"
                autoFocus
              />
              {codeError && (
                <p className="text-xs text-destructive">{codeError}</p>
              )}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Unlock
                </Button>
                <Button
                  type="button"
                  variant="ghost"
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
          </Card>
        </div>
      )}
    </main>
  );
}
