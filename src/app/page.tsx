"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Camera, Zap, Shield } from "lucide-react";
import { hasAccess, setAccess, validateAccessCode } from "@/lib/access";

export default function LandingPage() {
  const router = useRouter();
  const [showAccess, setShowAccess] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (hasAccess()) {
      setIsAuthorized(true);
    }
  }, []);

  const handleCta = () => {
    if (isAuthorized) {
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
    setCodeError("Incorrect code");
  };

  return (
    <main className="page-shell flex flex-col items-center justify-center">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8 text-center animate-fade-up">
        {/* Logo */}
        <div className="glass-panel p-4">
          <Camera className="h-8 w-8 text-cyan-300" />
        </div>

        {/* Hero */}
        <div className="space-y-4">
          <span className="glass-pill text-[10px]">PRIVATE BETA</span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-glow">
            Calorie AI
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Snap a photo of your food. Get instant calorie and macro estimates powered by AI.
          </p>
        </div>

        {/* Main CTA */}
        <Button size="lg" onClick={handleCta} className="h-14 px-8 text-base shine">
          {isAuthorized ? "Open Scanner" : "Enter Access Code"}
        </Button>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 w-full mt-4">
          <div className="glass-panel p-4 text-center">
            <Zap className="h-5 w-5 text-amber-300 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Instant</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <Shield className="h-5 w-5 text-emerald-300 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Private</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <Camera className="h-5 w-5 text-cyan-300 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Simple</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground mt-4">
          No account needed · Images never stored
        </p>
      </div>

      {/* Access Code Modal */}
      {showAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <Card className="w-full max-w-sm p-6 space-y-5 animate-fade-up">
            <div className="text-center space-y-2">
              <div className="glass-panel p-3 w-fit mx-auto">
                <Lock className="h-5 w-5 text-cyan-300" />
              </div>
              <h2 className="text-lg font-semibold">Enter access code</h2>
              <p className="text-xs text-muted-foreground">
                This app is invite-only during beta
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-lg tracking-widest text-white/90 placeholder:text-white/30 backdrop-blur focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  autoFocus
                />
                {codeError && (
                  <p className="text-xs text-destructive text-center mt-2">{codeError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 h-12">
                  Unlock
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
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
