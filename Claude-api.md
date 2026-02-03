# API Module – GPT-5.2 Nutrition Analysis

## Purpose

Single serverless endpoint that receives meal images and returns structured nutrition estimates via GPT-5.2 vision capabilities.

---

## Features

### POST /api/analyze

#### Constraints

- **Must** accept base64-encoded images (JPEG, PNG, WebP)
- **Must** validate image size (max 4MB)
- **Must** call GPT-5.2 with structured JSON output
- **Must** return consistent response schema
- **Must** handle errors gracefully with user-friendly messages
- *Should* compress/optimise image before API call
- *Should* timeout after 30 seconds

#### Input Schema

```typescript
interface AnalyzeRequest {
  image: string;        // Base64-encoded image data
  mimeType: string;     // "image/jpeg" | "image/png" | "image/webp"
}
```

#### Output Schema

```typescript
interface AnalyzeResponse {
  success: boolean;
  data?: MealAnalysis;
  error?: string;
}

interface MealAnalysis {
  totalCalories: number;
  macros: {
    protein: number;      // grams
    carbohydrates: number; // grams
    fat: number;          // grams
    fiber?: number;       // grams (optional)
  };
  foodItems: FoodItem[];
  confidence: "low" | "medium" | "high";
  notes?: string;         // Additional context or caveats
}

interface FoodItem {
  name: string;
  estimatedPortion: string;  // e.g., "1 cup", "150g"
  calories: number;
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_IMAGE` | Missing or malformed image data |
| 400 | `IMAGE_TOO_LARGE` | Image exceeds 4MB limit |
| 400 | `UNSUPPORTED_FORMAT` | Non-image file type |
| 500 | `AI_ERROR` | GPT-5.2 API failure |
| 500 | `PARSE_ERROR` | Failed to parse AI response |
| 504 | `TIMEOUT` | Request exceeded 30 seconds |

---

## GPT-5.2 Integration

### System Prompt

```text
You are a nutrition analysis assistant. Analyze the food in the provided image and estimate nutritional content.

CRITICAL RULES:
1. Return ONLY valid JSON matching the schema below
2. All calorie and macro values are ESTIMATES - communicate uncertainty
3. If you cannot identify the food clearly, set confidence to "low"
4. If the image is not food, return an error message
5. Round calories to nearest 5, macros to nearest 1g
6. List each distinct food item separately
7. Use common portion sizes (cups, pieces, grams)

JSON SCHEMA:
{
  "totalCalories": number,
  "macros": {
    "protein": number,
    "carbohydrates": number,
    "fat": number,
    "fiber": number | null
  },
  "foodItems": [
    {
      "name": string,
      "estimatedPortion": string,
      "calories": number
    }
  ],
  "confidence": "low" | "medium" | "high",
  "notes": string | null
}

CONFIDENCE GUIDELINES:
- HIGH: Clear, well-lit image of recognizable foods with visible portions
- MEDIUM: Somewhat obscured, mixed dishes, or unusual angles
- LOW: Poor lighting, heavily processed/mixed foods, unclear portions
```

### User Prompt

```text
Analyze this meal image and provide a detailed nutritional estimate. Return only the JSON response, no additional text.
```

### API Call Structure

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-5.2",  // Or current vision model
  messages: [
    {
      role: "system",
      content: SYSTEM_PROMPT
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: USER_PROMPT
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
            detail: "high"
          }
        }
      ]
    }
  ],
  response_format: { type: "json_object" },
  max_tokens: 1000,
  temperature: 0.3  // Lower for consistency
});
```

---

## Implementation Details

### File: `src/app/api/analyze/route.ts`

#### Flow

1. Parse request body
2. Validate image (presence, size, format)
3. Construct GPT-5.2 API call
4. Send request with timeout
5. Parse JSON response
6. Validate response schema
7. Return formatted result

#### Validation Functions

```typescript
function validateImage(image: string, mimeType: string): ValidationResult {
  // Check base64 validity
  // Check mime type is allowed
  // Check decoded size <= 4MB
  // Return { valid: boolean, error?: string }
}

function validateResponse(data: unknown): MealAnalysis | null {
  // Zod schema validation
  // Return parsed data or null
}
```

### File: `src/lib/openai.ts`

```typescript
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### File: `src/lib/prompts.ts`

```typescript
export const NUTRITION_SYSTEM_PROMPT = `...`;
export const NUTRITION_USER_PROMPT = `...`;
```

### File: `src/types/nutrition.ts`

```typescript
// All TypeScript interfaces defined above
// Zod schemas for runtime validation
```

---

## Rate Limiting Considerations

**MVP:** No rate limiting (rely on Vercel's default limits)

**Post-MVP:**
- Per-IP rate limiting (10 requests/minute)
- Usage tracking via Edge Config or Redis
- Graceful degradation messaging

---

## Cost Estimation

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Image Cost |
|-------|----------------------|------------------------|------------|
| GPT-5.2 Vision | ~$5 | ~$15 | ~$0.01-0.03 per image |

**Per-request estimate:** $0.02-0.05 depending on image complexity

**Monthly budget at 1000 daily users (2 scans each):**
- 60,000 requests × $0.03 = ~$1,800/month

---

## Security Constraints

1. **Must** validate all input server-side
2. **Must** not log or store image data
3. **Must** use environment variables for API keys
4. **Must** sanitize error messages (no stack traces to client)
5. *Should* implement request signing for production

---

## Testing Approach

### Unit Tests

- Image validation functions
- Response parsing/validation
- Error handling paths

### Integration Tests

- Happy path with test images
- Error scenarios (bad image, API failure)
- Timeout handling

### Manual Test Cases

| Scenario | Expected Result |
|----------|-----------------|
| Clear photo of salad | High confidence, itemised vegetables |
| Blurry pizza photo | Medium confidence, estimated slices |
| Non-food image | Error: "Unable to identify food" |
| Empty plate | Low confidence, minimal calories |
| Mixed curry dish | Medium confidence, general estimates |
