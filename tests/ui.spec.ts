import { test, expect } from "@playwright/test";

const ACCESS_CODE = "imfat";

test.describe("Landing Page", () => {
  test("should display app name and CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Calorie AI");
    await expect(page.getByRole("button", { name: /enter access code|open scanner/i })).toBeVisible();
  });

  test("should show access modal when clicking CTA", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /enter access code/i }).click();

    await expect(page.getByRole("heading", { name: /enter access code/i })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should reject invalid code", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /enter access code/i }).click();
    await page.locator('input[type="password"]').fill("wrong");
    await page.getByRole("button", { name: /unlock/i }).click();

    await expect(page.locator("text=Incorrect")).toBeVisible();
  });

  test("should accept valid code and redirect", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /enter access code/i }).click();
    await page.locator('input[type="password"]').fill(ACCESS_CODE);
    await page.getByRole("button", { name: /unlock/i }).click();

    await expect(page).toHaveURL("/app");
  });

  test("should show Open Scanner when already authorized", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("calorieai_access", "granted");
    });
    await page.reload();

    await expect(page.getByRole("button", { name: /open scanner/i })).toBeVisible();
  });
});

test.describe("App Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("calorieai_access", "granted");
    });
  });

  test("should display scanner UI", async ({ page }) => {
    await page.goto("/app");

    await expect(page.locator("text=Scan your meal")).toBeVisible();
  });

  test("should have back button", async ({ page }) => {
    await page.goto("/app");

    const backButton = page.getByRole("button").first();
    await expect(backButton).toBeVisible();
  });

  test("should redirect if not authorized", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem("calorieai_access");
    });

    await page.goto("/app");
    await expect(page).toHaveURL("/");
  });
});

test.describe("Results Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("calorieai_access", "granted");
    });
  });

  test("should redirect if no data", async ({ page }) => {
    await page.goto("/results");
    await expect(page).toHaveURL("/app");
  });

  test("should display results", async ({ page }) => {
    const mockData = {
      totalCalories: 450,
      macros: { protein: 25, carbohydrates: 45, fat: 18, fiber: 5, sugar: 8 },
      foodItems: [
        { name: "Chicken", estimatedPortion: "150g", calories: 250 },
        { name: "Rice", estimatedPortion: "1 cup", calories: 200 },
      ],
      confidence: "high",
      notes: null,
    };

    await page.goto("/app");
    await page.evaluate((data) => {
      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      sessionStorage.setItem("capturedImage", "dGVzdA==");
    }, mockData);

    await page.goto("/results");

    await expect(page.locator("text=Chicken")).toBeVisible();
    await expect(page.locator("text=Rice")).toBeVisible();
  });

  test("should have refine button", async ({ page }) => {
    const mockData = {
      totalCalories: 100,
      macros: { protein: 5, carbohydrates: 10, fat: 3, fiber: 1, sugar: 2 },
      foodItems: [{ name: "Test", estimatedPortion: "1pc", calories: 100 }],
      confidence: "low",
      notes: null,
    };

    await page.goto("/app");
    await page.evaluate((data) => {
      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      sessionStorage.setItem("capturedImage", "dGVzdA==");
    }, mockData);

    await page.goto("/results");

    await expect(page.getByRole("button", { name: /not accurate/i })).toBeVisible();
  });
});

test.describe("Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("landing works on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Calorie AI");
  });

  test("app works on mobile", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("calorieai_access", "granted");
    });
    await page.goto("/app");
    await expect(page.locator("text=Scan your meal")).toBeVisible();
  });
});
