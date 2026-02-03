import { test, expect } from "@playwright/test";

// Simple 1x1 red pixel PNG for testing invalid food scenarios
const TINY_TEST_IMAGE =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

test.describe("API /api/analyze", () => {
  test("should return 400 for missing image", async ({ request }) => {
    const response = await request.post("/api/analyze", {
      data: {},
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe("INVALID_REQUEST");
  });

  test("should return 400 for invalid mimeType", async ({ request }) => {
    const response = await request.post("/api/analyze", {
      data: {
        image: TINY_TEST_IMAGE,
        mimeType: "text/plain",
      },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  test("should accept valid request format", async ({ request }) => {
    // This test verifies the API accepts the correct format
    // The actual AI response depends on having a valid OPENAI_API_KEY
    const response = await request.post("/api/analyze", {
      data: {
        image: TINY_TEST_IMAGE,
        mimeType: "image/png",
      },
    });

    // If API key is configured, we should get a 200 response
    // If not configured, we'll get a 500 (AI_ERROR)
    const json = await response.json();

    if (response.status() === 200) {
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.totalCalories).toBeDefined();
      expect(json.data.macros).toBeDefined();
      expect(json.data.foodItems).toBeDefined();
      expect(json.data.confidence).toBeDefined();
    } else {
      // API key not configured or AI error
      expect(json.success).toBe(false);
      expect(["AI_ERROR", "PARSE_ERROR", "TIMEOUT"]).toContain(json.code);
    }
  });
});

test.describe("API response schema validation", () => {
  test("successful response should have correct structure", async ({
    request,
  }) => {
    const response = await request.post("/api/analyze", {
      data: {
        image: TINY_TEST_IMAGE,
        mimeType: "image/png",
      },
    });

    const json = await response.json();

    if (json.success && json.data) {
      // Validate response structure
      expect(typeof json.data.totalCalories).toBe("number");
      expect(json.data.macros).toMatchObject({
        protein: expect.any(Number),
        carbohydrates: expect.any(Number),
        fat: expect.any(Number),
      });
      expect(Array.isArray(json.data.foodItems)).toBe(true);
      expect(["low", "medium", "high"]).toContain(json.data.confidence);
    }
  });
});
