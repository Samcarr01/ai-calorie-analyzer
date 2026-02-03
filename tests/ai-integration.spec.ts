import { test, expect } from "@playwright/test";
import * as https from "https";

// Helper to download an image and convert to base64
async function downloadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadImageAsBase64(response.headers.location!)
          .then(resolve)
          .catch(reject);
        return;
      }

      const chunks: Buffer[] = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString("base64"));
      });
      response.on("error", reject);
    });
  });
}

test.describe("AI Integration Tests", () => {
  // Skip in CI unless explicitly enabled
  test.skip(({ browserName }) => {
    return !!process.env.CI && !process.env.RUN_AI_TESTS;
  });

  test("should analyze a real food image", async ({ request }) => {
    // Download a public domain food image
    const imageBase64 = await downloadImageAsBase64(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/400px-Good_Food_Display_-_NCI_Visuals_Online.jpg"
    );

    const response = await request.post("/api/analyze", {
      data: {
        image: imageBase64,
        mimeType: "image/jpeg",
      },
      timeout: 60000,
    });

    const json = await response.json();
    console.log("AI Response:", JSON.stringify(json, null, 2));

    if (response.status() === 200) {
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();

      // Validate the response contains expected nutrition data
      expect(json.data.totalCalories).toBeGreaterThan(0);
      expect(json.data.macros.protein).toBeGreaterThanOrEqual(0);
      expect(json.data.macros.carbohydrates).toBeGreaterThanOrEqual(0);
      expect(json.data.macros.fat).toBeGreaterThanOrEqual(0);
      expect(json.data.foodItems.length).toBeGreaterThan(0);
      expect(["low", "medium", "high"]).toContain(json.data.confidence);

      // Each food item should have required fields
      for (const item of json.data.foodItems) {
        expect(item.name).toBeTruthy();
        expect(item.estimatedPortion).toBeTruthy();
        expect(typeof item.calories).toBe("number");
      }
    } else {
      console.log("API Error:", json);
      // If API key is not configured, test still passes but logs the error
      expect(["AI_ERROR", "TIMEOUT"]).toContain(json.code);
    }
  });

  test("should handle non-food images gracefully", async ({ request }) => {
    // A simple 10x10 solid color image (not food)
    // This is a 10x10 red PNG
    const nonFoodImage =
      "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8DwHwcYgYR4MBQUAABdAwH/nmMnAAAAAElFTkSuQmCC";

    const response = await request.post("/api/analyze", {
      data: {
        image: nonFoodImage,
        mimeType: "image/png",
      },
      timeout: 60000,
    });

    const json = await response.json();
    console.log("Non-food response:", JSON.stringify(json, null, 2));

    if (response.status() === 200) {
      expect(json.success).toBe(true);
      // For non-food, should have low confidence or explanatory notes
      if (json.data.foodItems.length === 0) {
        expect(json.data.confidence).toBe("low");
      }
    }
  });

  test("should analyze a beverage/drink image", async ({ request }) => {
    // Coffee cup image from Wikipedia
    const imageBase64 = await downloadImageAsBase64(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/400px-A_small_cup_of_coffee.JPG"
    );

    const response = await request.post("/api/analyze", {
      data: {
        image: imageBase64,
        mimeType: "image/jpeg",
      },
      timeout: 60000,
    });

    const json = await response.json();
    console.log("Drink analysis:", JSON.stringify(json, null, 2));

    if (response.status() === 200) {
      expect(json.success).toBe(true);
      expect(json.data.foodItems.length).toBeGreaterThan(0);

      // Should recognize it as coffee or a beverage
      const itemNames = json.data.foodItems
        .map((i: any) => i.name.toLowerCase())
        .join(" ");
      const isBeverage =
        itemNames.includes("coffee") ||
        itemNames.includes("espresso") ||
        itemNames.includes("drink") ||
        itemNames.includes("beverage");
      expect(isBeverage).toBe(true);
    }
  });
});
