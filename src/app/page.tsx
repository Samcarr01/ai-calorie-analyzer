"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Sparkles, ShieldCheck, ScanLine } from "lucide-react";
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="text-center space-y-4 animate-fade-up">
          <div className="flex justify-center">
            <span className="glass-pill">Liquid Glass • iOS 26</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-glow">
            Calorie AI
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            A private, Apple-like nutrition scanner. Capture a meal and get a
            clean breakdown in seconds.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3 animate-fade-up delay-1">
          {[
            {
              title: "Private by default",
              description: "No accounts, no storage. Your photo stays yours.",
              icon: ShieldCheck,
            },
            {
              title: "Liquid glass UI",
              description: "Depth, blur, and glow inspired by iOS 26.",
              icon: Sparkles,
            },
            {
              title: "Instant analysis",
              description: "Calories, macros, and confidence in moments.",
              icon: ScanLine,
            },
          ].map((feature) => (
            <Card key={feature.title} className="p-5">
              <feature.icon className="h-5 w-5 text-cyan-200" />
              <p className="text-sm font-semibold mt-4">{feature.title}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {feature.description}
              </p>
            </Card>
          ))}
        </section>

        <section className="glass-card p-6 md:p-8 flex flex-col gap-6 animate-fade-up delay-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Private access</p>
              <h2 className="text-2xl font-semibold">Enter with a code</h2>
            </div>
            <div className="glass-pill text-[10px] tracking-[0.3em]">
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
