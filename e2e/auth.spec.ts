import { test, expect } from "@playwright/test";

test.describe("Spendwise Authentication Flow", () => {
  test("signup page renders all required fields and Google OAuth option", async ({
    page,
  }) => {
    // Navigate to signup page
    await page.goto("/signup");

    // Verify page heading
    await expect(
      page.getByRole("heading", { name: /Create an account/i })
    ).toBeVisible();

    // Verify form input fields
    await expect(page.locator("input#fullName")).toBeVisible();
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
    await expect(page.locator("input#confirmPassword")).toBeVisible();

    // Verify CTA and Google OAuth button
    await expect(
      page.getByRole("button", { name: "Create account" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continue with Google/i })
    ).toBeVisible();

    // Verify sign in link
    await expect(
      page.getByRole("link", { name: "Sign in" })
    ).toBeVisible();
  });

  test("login with invalid credentials shows an error message", async ({
    page,
  }) => {
    // Navigate to login page
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();

    // Fill in incorrect credentials
    await page.locator("input#email").fill("nonexistent@example.com");
    await page.locator("input#password").fill("IncorrectPassword123!");

    // Submit the login form
    await page.getByRole("button", { name: "Sign in" }).click();

    // Expect an error alert or toast message
    await expect(
      page.getByText(/Invalid email or password/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("unauthenticated visit to /dashboard redirects to /login", async ({
    page,
    context,
  }) => {
    // Clear cookies to ensure unauthenticated state
    await context.clearCookies();

    // Attempt direct navigation to protected /dashboard route
    await page.goto("/dashboard");

    // Expect redirect to /login with next query parameter
    await expect(page).toHaveURL(/\/login(\?next=.*)?/);

    // Verify login screen is displayed
    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();
  });
});
