# Prompt 02: API Analyze Endpoint

## 🧠 CONTEXT

Reference: `Claude-api.md` → POST /api/analyze

This prompt implements the core GPT-5.2 vision analysis endpoint. It receives base64 images and returns structured nutrition data.

**Prerequisites:** Prompt 01 (Project Scaffold) completed.

---

## 📋 TASK

Generate a complete serverless API endpoint that:

1. Accepts POST requests with base64-encoded meal images
2. Validates image data (format, size)
3. Calls GPT-5.2 with the nutrition analysis prompt
4. Parses and validates the AI response
5. Returns structured nutrition data or error responses

---

## ⚠️ CONSTRAINTS

1. **Must** use Next.js App Router API route (`src/app/api/analyze/route.ts`)
2. **Must** validate image mime type (JPEG, PNG, WebP only)
3. **Must** validate image size (max 4MB decoded)
4. **Must** use Zod for request and response validation
5. **Must** implement timeout handling (30 seconds)
6. **Must** return consistent error format
7. **Must** use structured JSON output from GPT-5.2
8. **Must** handle API errors gracefully (no stack traces to client)
9. **Must not** log or store image data
10. *Should* use `temperature: 0.3` for consistent results

---

## 📝 OUTPUT FORMAT

### File: `src/app/api/analyze/route.ts`

Complete implementation including:

```typescript
// Imports
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { NUTRITION_SYSTEM_PROMPT, NUTRITION_USER_PROMPT } from "@/lib/prompts";
import { AnalyzeRequestSchema, MealAnalysisSchema } from "@/types/nutrition";

// POST handler
export async function POST(request: NextRequest) {
  // 1. Parse request body
  // 2. Validate with Zod
  // 3. Check image size
  // 4. Call GPT-5.2
  // 5. Parse response
  // 6. Return result
}

// Helper functions
function validateImageSize(base64: string): boolean { ... }
function parseAIResponse(content: string): MealAnalysis | null { ... }
```

### File: `src/lib/openai.ts`

```typescript
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### File: `src/lib/prompts.ts`

Complete system and user prompts as defined in `Claude-api.md`:

```typescript
export const NUTRITION_SYSTEM_PROMPT = `
You are a nutrition analysis assistant...
[Full prompt from Claude-api.md]
`;

export const NUTRITION_USER_PROMPT = `
Analyze this meal image and provide a detailed nutritional estimate...
`;
```

### File: `src/types/nutrition.ts`

Complete Zod schemas and TypeScript types:

```typescript
import { z } from "zod";

// Request schema
export const AnalyzeRequestSchema = z.object({
  image: z.string().min(1, "Image data required"),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

// Response schemas
export const FoodItemSchema = z.object({
  name: z.string(),
  estimatedPortion: z.string(),
  calories: z.number(),
});

export const MacrosSchema = z.object({
  protein: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),
  fiber: z.number().optional(),
});

export const MealAnalysisSchema = z.object({
  totalCalories: z.number(),
  macros: MacrosSchema,
  foodItems: z.array(FoodItemSchema),
  confidence: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
});

// TypeScript types (inferred from Zod)
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type Macros = z.infer<typeof MacrosSchema>;
export type MealAnalysis = z.infer<typeof MealAnalysisSchema>;

// API Response type
export interface AnalyzeResponse {
  success: boolean;
  data?: MealAnalysis;
  error?: string;
  code?: string;
}
```

---

## 🧪 TEST CASES

After implementation, test with:

### Happy Path

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64_image_data>", "mimeType": "image/jpeg"}'
```

Expected: 200 OK with `MealAnalysis` data

### Invalid Image

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "", "mimeType": "image/jpeg"}'
```

Expected: 400 with `INVALID_IMAGE` error

### Unsupported Format

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "<data>", "mimeType": "image/gif"}'
```

Expected: 400 with `UNSUPPORTED_FORMAT` error

---

## ✅ VERIFICATION

- [ ] API returns 200 with valid nutrition data for real food images
- [ ] API returns 400 for invalid requests
- [ ] API returns 500 gracefully when OpenAI fails
- [ ] No sensitive data in error responses
- [ ] Response matches `MealAnalysisSchema`

---

## 🔗 NEXT PROMPT

After completing this endpoint, proceed to `03-ui-camera.md` to implement the camera capture interface.
