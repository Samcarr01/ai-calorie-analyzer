import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { NUTRITION_SYSTEM_PROMPT, NUTRITION_USER_PROMPT } from "@/lib/prompts";
import {
  AnalyzeRequestSchema,
  MealAnalysisSchema,
  type AnalyzeResponse,
  type MealAnalysis,
} from "@/types/nutrition";
import { ZodError } from "zod";

// Maximum image size: 4MB
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

// API timeout: 30 seconds
const API_TIMEOUT = 30000;

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";

const MEAL_ANALYSIS_JSON_SCHEMA = {
  type: "json_schema",
  name: "meal_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      totalCalories: { type: "number" },
      macros: {
        type: "object",
        additionalProperties: false,
        properties: {
          protein: { type: "number" },
          carbohydrates: { type: "number" },
          fat: { type: "number" },
          fiber: { type: ["number", "null"] },
        },
        required: ["protein", "carbohydrates", "fat", "fiber"],
      },
      foodItems: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            estimatedPortion: { type: "string" },
            calories: { type: "number" },
          },
          required: ["name", "estimatedPortion", "calories"],
        },
      },
      confidence: { type: "string", enum: ["low", "medium", "high"] },
      notes: { type: ["string", "null"] },
    },
    required: ["totalCalories", "macros", "foodItems", "confidence", "notes"],
  },
} as const;

/**
 * Validates base64 image data and checks size
 */
function validateImageSize(base64: string): { valid: boolean; error?: string } {
  try {
    // Remove data URL prefix if present
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

    // Calculate size from base64
    const padding = (base64Data.match(/=/g) || []).length;
    const sizeInBytes = Math.floor((base64Data.length * 3) / 4) - padding;

    if (sizeInBytes > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `Image size (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 4MB`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "Failed to validate image size",
    };
  }
}

/**
 * Parses and validates AI response
 */
function parseAIResponse(content: string): MealAnalysis | null {
  try {
    const parsed = JSON.parse(content);
    return MealAnalysisSchema.parse(parsed);
  } catch (error) {
    // Try to recover JSON if the model wrapped it in text
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        const extracted = content.slice(start, end + 1);
        const parsed = JSON.parse(extracted);
        return MealAnalysisSchema.parse(parsed);
      } catch (secondaryError) {
        console.error("Failed to parse extracted AI response:", secondaryError);
      }
    }

    console.error("Failed to parse AI response:", error);
    return null;
  }
}

/**
 * Calls OpenAI API with timeout
 */
async function callOpenAIWithTimeout(
  imageData: string,
  mimeType: string,
  timeoutMs: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await openai.responses.create(
      {
        model: OPENAI_MODEL,
        instructions: NUTRITION_SYSTEM_PROMPT,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: NUTRITION_USER_PROMPT },
              {
                type: "input_image",
                image_url: `data:${mimeType};base64,${imageData}`,
                detail: "high",
              },
            ],
          },
        ],
        text: {
          format: MEAL_ANALYSIS_JSON_SCHEMA,
        },
        max_output_tokens: 900,
        temperature: 0.2,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const content = response.output_text?.trim();
    if (!content) {
      throw new Error("No content in AI response");
    }

    return content;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("TIMEOUT");
    }

    throw error;
  }
}

/**
 * POST /api/analyze
 * Analyzes a meal image and returns nutritional estimates
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request with Zod
    let validatedRequest;
    try {
      validatedRequest = AnalyzeRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const response: AnalyzeResponse = {
          success: false,
          error: "Invalid request format",
          code: "INVALID_REQUEST",
        };
        return NextResponse.json(response, { status: 400 });
      }
      throw error;
    }

    const { image, mimeType } = validatedRequest;

    // Validate image size
    const sizeValidation = validateImageSize(image);
    if (!sizeValidation.valid) {
      const response: AnalyzeResponse = {
        success: false,
        error: sizeValidation.error || "Image validation failed",
        code: "IMAGE_TOO_LARGE",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Call OpenAI API with timeout
    let aiResponse: string;
    try {
      aiResponse = await callOpenAIWithTimeout(image, mimeType, API_TIMEOUT);
    } catch (error: any) {
      if (error.message === "TIMEOUT") {
        const response: AnalyzeResponse = {
          success: false,
          error: "Analysis request timed out. Please try again.",
          code: "TIMEOUT",
        };
        return NextResponse.json(response, { status: 504 });
      }

      // OpenAI API error
      console.error("OpenAI API error:", error);
      const response: AnalyzeResponse = {
        success: false,
        error: "AI analysis service is temporarily unavailable. Please try again.",
        code: "AI_ERROR",
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Parse and validate AI response
    const analysisData = parseAIResponse(aiResponse);
    if (!analysisData) {
      const response: AnalyzeResponse = {
        success: false,
        error: "Failed to parse analysis results. Please try again.",
        code: "PARSE_ERROR",
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Return successful response
    const response: AnalyzeResponse = {
      success: true,
      data: analysisData,
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    // Catch-all error handler
    console.error("Unexpected error in /api/analyze:", error);
    const response: AnalyzeResponse = {
      success: false,
      error: "An unexpected error occurred. Please try again.",
      code: "INTERNAL_ERROR",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
