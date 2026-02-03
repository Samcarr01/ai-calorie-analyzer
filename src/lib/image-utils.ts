export interface CompressedImage {
  base64: string;
  mimeType: "image/jpeg";
  originalSize: number;
  compressedSize: number;
}

/**
 * Compresses an image from various sources (canvas, video, file)
 * @param source - The source image (HTMLCanvasElement, HTMLVideoElement, or File)
 * @param options - Compression options
 * @returns Compressed image data with metadata
 */
export async function compressImage(
  source: HTMLCanvasElement | HTMLVideoElement | File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<CompressedImage> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options ?? {};

  // Create an offscreen canvas for compression
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  let img: HTMLImageElement | HTMLVideoElement;
  let originalSize = 0;

  // Handle different source types
  if (source instanceof HTMLVideoElement) {
    // Video element - capture current frame
    img = source;
    const { videoWidth, videoHeight } = source;

    // Calculate scaled dimensions
    const { width, height } = calculateScaledDimensions(
      videoWidth,
      videoHeight,
      maxWidth,
      maxHeight
    );

    canvas.width = width;
    canvas.height = height;

    // Draw video frame to canvas
    ctx.drawImage(source, 0, 0, width, height);

    // Estimate original size (video frame)
    originalSize = videoWidth * videoHeight * 4; // RGBA
  } else if (source instanceof HTMLCanvasElement) {
    // Canvas element
    const { width: srcWidth, height: srcHeight } = source;

    // Calculate scaled dimensions
    const { width, height } = calculateScaledDimensions(
      srcWidth,
      srcHeight,
      maxWidth,
      maxHeight
    );

    canvas.width = width;
    canvas.height = height;

    // Draw canvas to canvas
    ctx.drawImage(source, 0, 0, width, height);

    // Estimate original size
    originalSize = srcWidth * srcHeight * 4; // RGBA
  } else {
    // File input
    originalSize = source.size;

    // Load image from file
    const imageElement = await loadImageFromFile(source);

    // Calculate scaled dimensions
    const { width, height } = calculateScaledDimensions(
      imageElement.naturalWidth,
      imageElement.naturalHeight,
      maxWidth,
      maxHeight
    );

    canvas.width = width;
    canvas.height = height;

    // Draw image to canvas
    ctx.drawImage(imageElement, 0, 0, width, height);
  }

  // Convert canvas to JPEG blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      "image/jpeg",
      quality
    );
  });

  // Convert blob to base64
  const base64 = await blobToBase64(blob);

  // Remove data URL prefix if present
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

  return {
    base64: base64Data,
    mimeType: "image/jpeg",
    originalSize,
    compressedSize: blob.size,
  };
}

/**
 * Calculates scaled dimensions while maintaining aspect ratio
 */
function calculateScaledDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = srcWidth;
  let height = srcHeight;

  // Scale down if needed
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Loads an image from a File object
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Converts a Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Calculates the size of a base64 string in bytes
 */
export function base64ToSize(base64: string): number {
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Formats a byte size to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
