# Prompt 03: Camera Capture UI

## 🧠 CONTEXT

Reference: `Claude-ui.md` → Camera Capture

This prompt implements the mobile-first camera capture interface with image compression and fallback upload functionality.

**Prerequisites:** Prompts 01-02 completed.

---

## 📋 TASK

Generate a complete camera capture implementation that:

1. Requests and manages camera permissions
2. Displays live camera preview
3. Captures photos with a single tap
4. Provides file upload fallback
5. Compresses images client-side
6. Handles all error states gracefully

---

## ⚠️ CONSTRAINTS

1. **Must** use `navigator.mediaDevices.getUserMedia` for camera access
2. **Must** default to rear camera (`facingMode: "environment"`)
3. **Must** compress images to max 1200px width and 80% quality
4. **Must** output JPEG format for compression
5. **Must** handle permission denial with upload-only UI
6. **Must** show loading state during capture/compression
7. **Must** use shadcn/ui components (Button, Card)
8. **Must** be fully responsive (mobile-first)
9. **Must not** store images after capture
10. *Should* show camera switch button when front camera available
11. *Should* animate capture button on press

---

## 📝 OUTPUT FORMAT

### File: `src/components/CameraCapture.tsx`

Complete implementation:

```typescript
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, SwitchCamera, Loader2 } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageData: string, mimeType: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, onError, disabled }: CameraCaptureProps) {
  // State management
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera permission and stream setup
  useEffect(() => { /* ... */ }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => { /* ... */ }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(async () => { /* ... */ }, [onCapture]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ }, [onCapture, onError]);

  // Toggle camera facing mode
  const toggleCamera = useCallback(() => { /* ... */ }, []);

  // Render based on permission state
  // ...
}
```

### File: `src/lib/image-utils.ts`

Image compression utilities:

```typescript
export interface CompressedImage {
  base64: string;
  mimeType: "image/jpeg";
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(
  source: HTMLCanvasElement | HTMLVideoElement | File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<CompressedImage> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options ?? {};
  
  // Implementation:
  // 1. Create offscreen canvas
  // 2. Calculate scaled dimensions (maintain aspect ratio)
  // 3. Draw source to canvas
  // 4. Export as JPEG with quality
  // 5. Convert to base64
  // 6. Return compressed result
}

export function base64ToSize(base64: string): number {
  // Calculate approximate byte size from base64
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

### File: `src/app/page.tsx`

Updated home page with camera integration:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/CameraCapture";
import { AnalyzingState } from "@/components/AnalyzingState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AnalyzeResponse } from "@/types/nutrition";

export default function HomePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = async (imageData: string, mimeType: string) => {
    setError(null);
    setCapturedImage(imageData);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, mimeType }),
      });

      const result: AnalyzeResponse = await response.json();

      if (result.success && result.data) {
        // Store result and navigate
        sessionStorage.setItem("analysisResult", JSON.stringify(result.data));
        sessionStorage.setItem("capturedImage", imageData);
        router.push("/results");
      } else {
        setError(result.error || "Analysis failed. Please try again.");
        setIsAnalyzing(false);
      }
    } catch (err) {
      setError("Unable to connect. Please check your internet connection.");
      setIsAnalyzing(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (isAnalyzing && capturedImage) {
    return <AnalyzingState imageData={capturedImage} />;
  }

  return (
    <main className="min-h-screen flex flex-col p-4">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">Calorie Analyzer</h1>
        <p className="text-muted-foreground">
          Take a photo of your meal
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CameraCapture
        onCapture={handleCapture}
        onError={handleError}
        disabled={isAnalyzing}
      />
    </main>
  );
}
```

### File: `src/components/AnalyzingState.tsx`

Loading state component:

```typescript
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
    // Simulated progress for UX
    const messages = [
      "Analyzing your meal...",
      "Identifying foods...",
      "Calculating nutrition...",
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
          <img
            src={`data:image/jpeg;base64,${imageData}`}
            alt="Captured meal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="font-medium">{message}</p>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Usually takes 2-3 seconds
          </p>
        </div>
      </Card>
    </main>
  );
}
```

---

## 🧪 TEST CASES

### Camera Permission Granted

1. Open app on mobile device
2. Grant camera permission
3. Camera preview should display
4. Capture button should be visible

### Camera Permission Denied

1. Open app and deny camera permission
2. Upload-only UI should display
3. Upload button should work
4. Error message explains situation

### File Upload

1. Click upload button
2. Select image from gallery
3. Image should compress
4. Analysis should start

### Image Compression

1. Capture/upload large image (>2MB)
2. Compressed size should be <1MB
3. Quality should be acceptable

---

## ✅ VERIFICATION

- [ ] Camera preview displays on mobile
- [ ] Capture button captures current frame
- [ ] Upload fallback works on desktop
- [ ] Images compress to under 1MB
- [ ] Permission denial handled gracefully
- [ ] Loading state displays during analysis

---

## 🔗 NEXT PROMPT

After completing this component, proceed to `04-ui-results.md` to implement the results display page.
