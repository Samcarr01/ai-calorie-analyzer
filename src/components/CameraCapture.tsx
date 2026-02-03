"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, SwitchCamera, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/image-utils";

interface CameraCaptureProps {
  onCapture: (imageData: string, mimeType: string, context?: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function CameraCapture({
  onCapture,
  onError,
  disabled = false,
}: CameraCaptureProps) {
  // State management
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasFrontCamera, setHasFrontCamera] = useState(false);
  const [context, setContext] = useState("");

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request camera permission and start stream
  const startCamera = useCallback(async () => {
    try {
      // Check if devices are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      // Check if there are multiple cameras
      setHasFrontCamera(videoDevices.length > 1);

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });

      const [track] = mediaStream.getVideoTracks();
      const capabilities = track?.getCapabilities?.();
      const advanced: MediaTrackConstraintSet[] = [];

      if (capabilities && "focusMode" in capabilities) {
        const focusModes = (capabilities as any).focusMode as string[];
        if (focusModes?.includes("continuous")) {
          advanced.push({ focusMode: "continuous" } as any);
        }
      }

      if (capabilities && "exposureMode" in capabilities) {
        const exposureModes = (capabilities as any).exposureMode as string[];
        if (exposureModes?.includes("continuous")) {
          advanced.push({ exposureMode: "continuous" } as any);
        }
      }

      if (advanced.length && track?.applyConstraints) {
        track.applyConstraints({ advanced }).catch(() => undefined);
      }

      setStream(mediaStream);
      setHasPermission(true);
    } catch (error: any) {
      console.error("Camera access error:", error);
      setHasPermission(false);

      if (error.name === "NotAllowedError") {
        onError(
          "Camera access denied. Please allow camera access to capture photos."
        );
      } else if (error.name === "NotFoundError") {
        onError("No camera found on this device.");
      } else {
        onError(
          "Unable to access camera. Please check your device settings."
        );
      }
    }
  }, [facingMode, onError]);

  // Attach stream to video element whenever it becomes available
  useEffect(() => {
    if (!videoRef.current || !stream) return;

    const video = videoRef.current;
    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    (video as any).webkitPlaysInline = true;

    const tryPlay = () => {
      video
        .play()
        .catch((error) =>
          console.warn("Video autoplay failed, user interaction may be required:", error)
        );
    };

    // Some browsers require waiting for metadata before play
    if (video.readyState >= 1) {
      tryPlay();
    } else {
      video.onloadedmetadata = () => {
        tryPlay();
      };
    }
  }, [stream]);

  // Initialize camera on mount and when facing mode changes
  useEffect(() => {
    startCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Capture photo from video stream
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || isCapturing || disabled) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;

      // Create canvas and draw current video frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      ctx.drawImage(video, 0, 0);

      // Compress the image
      const compressed = await compressImage(canvas, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
      });

      // Call onCapture with compressed image and optional context
      onCapture(compressed.base64, compressed.mimeType, context || undefined);
    } catch (error) {
      console.error("Capture error:", error);
      onError("Failed to capture photo. Please try again.");
      setIsCapturing(false);
    }
  }, [onCapture, onError, isCapturing, disabled, context]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || isCapturing || disabled) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        onError("Please select an image file.");
        return;
      }

      setIsCapturing(true);

      try {
        // Compress the uploaded image
        const compressed = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8,
        });

        // Call onCapture with compressed image and optional context
        onCapture(compressed.base64, compressed.mimeType, context || undefined);
      } catch (error) {
        console.error("Upload error:", error);
        onError("Failed to process image. Please try again.");
        setIsCapturing(false);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onCapture, onError, isCapturing, disabled, context]
  );

  // Toggle camera facing mode
  const toggleCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, [stream]);

  // Render loading state while checking permissions
  if (hasPermission === null) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Requesting camera access...
          </p>
        </div>
      </Card>
    );
  }

  // Render upload-only UI if permission denied
  if (hasPermission === false) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Alert>
            <AlertDescription>
              Camera access is not available. You can still upload photos from
              your gallery.
            </AlertDescription>
          </Alert>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={disabled || isCapturing}
          />

          <Button
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isCapturing}
            className="w-full h-14"
          >
            {isCapturing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload Photo
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  // Render camera UI with permission granted
  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Live preview</p>
            <p className="text-sm font-semibold">Camera feed</p>
          </div>
          {hasFrontCamera && (
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleCamera}
              disabled={disabled || isCapturing}
            >
              <SwitchCamera className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="camera-frame">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-feed"
          />
          <div className="camera-grid" />
          <div className="camera-corners" />
          <div className="camera-focus" />
          <div className="camera-vignette" />
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] items-center">
          <input
            type="text"
            placeholder="Add a short note for complex meals or drinks"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={disabled || isCapturing}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30"
            maxLength={500}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={disabled || isCapturing}
          />
          <Button
            variant="outline"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isCapturing}
            className="h-12 w-full md:w-auto"
          >
            <Upload className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={capturePhoto}
            disabled={disabled || isCapturing}
            className="flex-1 h-14 shine"
          >
            {isCapturing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Capturing...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-5 w-5" />
                Capture Photo
              </>
            )}
          </Button>
          <div className="glass-panel px-4 py-3 text-xs text-muted-foreground sm:w-56">
            Keep the whole plate visible for sharper results.
          </div>
        </div>
      </div>
    </Card>
  );
}
