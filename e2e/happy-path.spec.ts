import { test, expect } from "@playwright/test";

test.describe("Spendwise Happy Path", () => {
  test("loads auth / login page and validates form structure", async ({
    page,
  }) => {
    // Navigate to login
    await page.goto("/login");

    // Check title & branding
    await expect(page).toHaveTitle(/Spendwise/i);
    await expect(
      page.getByRole("heading", { name: "Welcome back" })
    ).toBeVisible();

    // Check form inputs are accessible and rendered
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

    // Check Google OAuth button is present
    await expect(
      page.getByRole("button", { name: /Continue with Google|Sign in with Google/i })
    ).toBeVisible();

    // Verify navigation link to signup
    const createAccountLink = page.getByRole("link", {
      name: "Create account",
    });
    await expect(createAccountLink).toBeVisible();
    await createAccountLink.click();

    // Expect signup page
    await expect(page).toHaveURL(/.*signup/);
    await expect(
      page.getByRole("heading", { name: "Create an account" })
    ).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();
  });
});
