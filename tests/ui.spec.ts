import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display main heading and description", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("AI Calorie Analyzer");
    await expect(page.locator("text=Take a photo of your meal")).toBeVisible();
  });

  test("should have camera controls or upload button", async ({ page }) => {
    await page.goto("/");

    // Wait for camera permission prompt to resolve
    await page.waitForTimeout(2000);

    // Should show either camera UI or upload-only UI
    const cameraButton = page.getByRole("button", { name: /capture/i });
    const uploadButton = page.getByRole("button", { name: /upload/i });

    // At least one option should be available
    const hasCapture = await cameraButton.isVisible().catch(() => false);
    const hasUpload = await uploadButton.isVisible().catch(() => false);

    expect(hasCapture || hasUpload).toBe(true);
  });

  test("should show footer disclaimer", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator("text=Estimates are based on AI analysis")
    ).toBeVisible();
  });
});

test.describe("Results Page", () => {
  test("should redirect to home if no data", async ({ page }) => {
    await page.goto("/results");

    // Should redirect to home page
    await expect(page).toHaveURL("/");
  });

  test("should display results when data is in sessionStorage", async ({
    page,
  }) => {
    const mockData = {
      totalCalories: 450,
      macros: {
        protein: 25,
        carbohydrates: 45,
        fat: 18,
        fiber: 5,
        sugar: 8,
      },
      foodItems: [
        { name: "Grilled Chicken", estimatedPortion: "150g", calories: 250 },
        { name: "Rice", estimatedPortion: "1 cup", calories: 200 },
      ],
      confidence: "high",
      notes: "Well-balanced meal",
    };

    await page.goto("/");

    // Set sessionStorage before navigating to results
    await page.evaluate((data) => {
      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      sessionStorage.setItem("capturedImage", "dGVzdA=="); // base64 "test"
    }, mockData);

    await page.goto("/results");

    // Check that results are displayed
    await expect(page.locator("text=Nutrition Results")).toBeVisible();
    await expect(page.locator("text=calories")).toBeVisible();
    await expect(page.locator("text=Grilled Chicken")).toBeVisible();
    await expect(page.locator("text=Rice")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /analyze another/i })
    ).toBeVisible();
  });

  test("should navigate back when clicking Analyze Another", async ({
    page,
  }) => {
    const mockData = {
      totalCalories: 300,
      macros: { protein: 20, carbohydrates: 30, fat: 10, fiber: 3, sugar: 5 },
      foodItems: [{ name: "Test Food", estimatedPortion: "1 piece", calories: 300 }],
      confidence: "medium",
      notes: null,
    };

    await page.goto("/");
    await page.evaluate((data) => {
      sessionStorage.setItem("analysisResult", JSON.stringify(data));
    }, mockData);

    await page.goto("/results");
    await page.getByRole("button", { name: /analyze another/i }).click();

    await expect(page).toHaveURL("/");
  });
});

test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should be usable on mobile viewport", async ({ page }) => {
    await page.goto("/");

    // Heading should be visible
    await expect(page.locator("h1")).toBeVisible();

    // Buttons should be large enough for touch
    const uploadButton = page.getByRole("button", { name: /upload/i });
    if (await uploadButton.isVisible().catch(() => false)) {
      const box = await uploadButton.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    }
  });
});
