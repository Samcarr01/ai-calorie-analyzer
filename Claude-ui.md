# UI Module – Mobile-First Nutrition Analyzer

## Purpose

Deliver a fast, intuitive mobile experience for capturing meal photos and displaying nutrition analysis results. Touch-optimised, accessible, and designed for the "aha moment" of instant feedback.

---

## Features

### Camera Capture

#### Constraints

- **Must** use native camera API (`getUserMedia`) on mobile
- **Must** provide file upload fallback for desktop/unsupported browsers
- **Must** compress images client-side before sending (max 1MB, 1200px width)
- **Must** show real-time camera preview
- **Must** handle camera permission denial gracefully
- **Must** support both rear and front cameras (default: rear)
- *Should* auto-focus on tap
- *Should* show capture confirmation before analysis

#### User Flow

```
┌─────────────────────────────────────┐
│           CAMERA VIEW               │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │      [Camera Preview]       │    │
│  │                             │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  [📷 Capture]     [📁 Upload]       │
│                                     │
│  "Point your camera at your meal"   │
└─────────────────────────────────────┘
```

#### Component: `CameraCapture.tsx`

**Props:**
```typescript
interface CameraCaptureProps {
  onCapture: (imageData: string, mimeType: string) => void;
  onError: (error: string) => void;
}
```

**State:**
```typescript
interface CameraState {
  stream: MediaStream | null;
  hasPermission: boolean | null;
  facingMode: "user" | "environment";
  isCapturing: boolean;
}
```

**Behaviours:**
1. On mount: Request camera permission
2. On permission granted: Start video stream
3. On capture click: Grab frame, compress, call `onCapture`
4. On upload click: Open file picker, compress, call `onCapture`
5. On permission denied: Show upload-only UI with explanation

---

### Results Display

#### Constraints

- **Must** show total calories prominently (largest text)
- **Must** display macros (protein, carbs, fat) with visual indicators
- **Must** list detected food items with portions
- **Must** show confidence indicator with colour coding
- **Must** provide "Analyze Another" action
- *Should* animate numbers counting up on load
- *Should* use appropriate colours (green/yellow/red for confidence)

#### User Flow

```
┌─────────────────────────────────────┐
│         NUTRITION RESULTS           │
│                                     │
│         [Meal Image Thumb]          │
│                                     │
│            ⚡ 485                    │
│           calories                  │
│                                     │
│  ┌─────────┬─────────┬─────────┐    │
│  │ PROTEIN │  CARBS  │   FAT   │    │
│  │   32g   │   45g   │   18g   │    │
│  └─────────┴─────────┴─────────┘    │
│                                     │
│  Confidence: ●●●○○ Medium           │
│                                     │
│  📋 DETECTED FOODS                  │
│  • Grilled chicken breast (150g)    │
│  • Brown rice (1 cup)               │
│  • Steamed broccoli (100g)          │
│                                     │
│  ℹ️ "Estimates based on visible..."  │
│                                     │
│  [🔄 Analyze Another Meal]          │
└─────────────────────────────────────┘
```

#### Component: `NutritionCard.tsx`

**Props:**
```typescript
interface NutritionCardProps {
  calories: number;
  macros: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
  };
}
```

#### Component: `FoodItemList.tsx`

**Props:**
```typescript
interface FoodItemListProps {
  items: Array<{
    name: string;
    estimatedPortion: string;
    calories: number;
  }>;
}
```

#### Component: `ConfidenceIndicator.tsx`

**Props:**
```typescript
interface ConfidenceIndicatorProps {
  level: "low" | "medium" | "high";
}
```

**Visual Mapping:**
| Level | Colour | Dots | Message |
|-------|--------|------|---------|
| Low | Red (#EF4444) | ●○○○○ | "Rough estimate" |
| Medium | Yellow (#F59E0B) | ●●●○○ | "Good estimate" |
| High | Green (#22C55E) | ●●●●● | "Confident estimate" |

---

### Loading State

#### Constraints

- **Must** show skeleton UI during API call
- **Must** display "Analyzing your meal..." message
- **Must** show progress indicator (spinner or bar)
- *Should* show estimated wait time ("Usually takes 2-3 seconds")

#### Component: `AnalyzingState.tsx`

```
┌─────────────────────────────────────┐
│                                     │
│         [Captured Image]            │
│                                     │
│           ⏳ Analyzing...           │
│                                     │
│  ████████████░░░░░░░░░░░░░░░░░░░   │
│                                     │
│  "Understanding what you ate"       │
│                                     │
└─────────────────────────────────────┘
```

---

### Error States

#### Constraints

- **Must** show user-friendly error messages
- **Must** provide retry action
- **Must** offer fallback (try different photo)
- *Should* preserve captured image for retry

#### Error Messages

| Error Code | User Message |
|------------|--------------|
| `INVALID_IMAGE` | "We couldn't read that image. Please try a different photo." |
| `IMAGE_TOO_LARGE` | "That image is too large. Please try a smaller photo." |
| `AI_ERROR` | "We're having trouble analyzing right now. Please try again." |
| `TIMEOUT` | "Analysis is taking longer than expected. Please try again." |
| `NO_FOOD_DETECTED` | "We couldn't identify any food. Try a clearer photo." |

---

## Page Structure

### Home Page (`src/app/page.tsx`)

**Responsibilities:**
1. Display camera capture interface
2. Handle image capture/upload
3. Compress and validate image
4. Navigate to results on success
5. Show inline errors

**State:**
```typescript
interface HomePageState {
  capturedImage: string | null;
  mimeType: string | null;
  isAnalyzing: boolean;
  error: string | null;
}
```

### Results Page (`src/app/results/page.tsx`)

**Responsibilities:**
1. Display nutrition analysis results
2. Show captured image thumbnail
3. Provide "Analyze Another" action
4. Handle empty state (direct navigation)

**Data Flow:**
- Results passed via URL search params (encoded JSON) or
- Results stored in sessionStorage (preferred for larger data)

---

## Design System

### Typography

| Element | Size | Weight | Colour |
|---------|------|--------|--------|
| Calorie number | 4xl (36px) | Bold | Primary |
| Macro values | xl (20px) | Semibold | Primary |
| Macro labels | sm (14px) | Medium | Muted |
| Food items | base (16px) | Normal | Primary |
| Helper text | sm (14px) | Normal | Muted |

### Colours (Tailwind)

```typescript
const colors = {
  primary: "text-gray-900 dark:text-white",
  muted: "text-gray-500 dark:text-gray-400",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  background: "bg-white dark:bg-gray-900",
  card: "bg-gray-50 dark:bg-gray-800",
};
```

### Spacing

- Page padding: `p-4` (16px)
- Section gaps: `space-y-6` (24px)
- Card padding: `p-4` (16px)
- Button height: `h-12` (48px) for touch targets

### Components (shadcn/ui)

- `Button` – Primary actions
- `Card` – Content containers
- `Skeleton` – Loading states
- `Alert` – Error messages
- `Progress` – Analysis progress

---

## Responsive Behaviour

### Mobile (< 640px)

- Full-width camera preview
- Stacked macro cards
- Large touch targets (min 48px)

### Tablet (640px - 1024px)

- Centered content with max-width
- Side-by-side macro cards

### Desktop (> 1024px)

- Centered card layout (max-w-md)
- File upload prominently displayed
- Camera optional

---

## Accessibility

1. **Must** have descriptive alt text for captured images
2. **Must** use semantic HTML (headings, lists, buttons)
3. **Must** support keyboard navigation
4. **Must** announce loading/results to screen readers
5. **Must** maintain 4.5:1 contrast ratio
6. *Should* support reduced motion preferences

---

## PWA Considerations

### Manifest (`public/manifest.json`)

```json
{
  "name": "Calorie Analyzer",
  "short_name": "CalorieAI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

### Meta Tags

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#000000">
```

---

## Image Compression

### Client-Side Processing

```typescript
async function compressImage(
  file: File | Blob,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<{ base64: string; mimeType: string }> {
  // 1. Create canvas
  // 2. Draw image scaled to maxWidth
  // 3. Export as JPEG with quality
  // 4. Convert to base64
  // Return compressed result
}
```

### Constraints

- Max dimension: 1200px (width or height)
- Quality: 0.8 (80%)
- Output format: JPEG (smaller than PNG for photos)
- Max output size: 1MB
