import { z } from "zod";

// Request schema
export const AnalyzeRequestSchema = z.object({
  image: z.string().min(1, "Image data required"),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

// Food item schema
export const FoodItemSchema = z.object({
  name: z.string(),
  estimatedPortion: z.string(),
  calories: z.number(),
});

// Macros schema
export const MacrosSchema = z.object({
  protein: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),
  fiber: z.number().nullable(),
  sugar: z.number().nullable(),
});

// Meal analysis schema
export const MealAnalysisSchema = z.object({
  totalCalories: z.number(),
  macros: MacrosSchema,
  foodItems: z.array(FoodItemSchema),
  confidence: z.enum(["low", "medium", "high"]),
  notes: z.string().nullable(),
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
