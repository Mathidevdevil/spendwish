import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const VIEWPORTS = [
  { name: "375px", width: 375, height: 812 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1440px", width: 1440, height: 900 },
];

test.describe("Phase 0 Audit - Capture Before Screenshots and Metrics", () => {
  const auditDir = path.resolve(process.cwd(), "audit", "before");

  test.beforeAll(() => {
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }
  });

  for (const vp of VIEWPORTS) {
    test(`capture audit screens and measure transitions at ${vp.name}`, async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
        if (msg.type() === "warning") consoleWarnings.push(msg.text());
      });

      // 1. Login page
      await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
      await page.screenshot({
        path: path.join(auditDir, `login-${vp.name}.png`),
        fullPage: true,
      });

      // 2. Signup page
      await page.goto("http://localhost:3000/signup", { waitUntil: "networkidle" });
      await page.screenshot({
        path: path.join(auditDir, `signup-${vp.name}.png`),
        fullPage: true,
      });

      // 3. Authenticate with demo session
      await context.addCookies([
        {
          name: "spendwise_demo_session",
          value: "true",
          domain: "localhost",
          path: "/",
        },
        {
          name: "spendwise_user_email",
          value: "demo@spendwise.app",
          domain: "localhost",
          path: "/",
        },
        {
          name: "spendwise_user_name",
          value: "Aarav Sharma",
          domain: "localhost",
          path: "/",
        },
      ]);

      // 4. Dashboard page
      const t0 = Date.now();
      await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
      const dashboardLoad = Date.now() - t0;
      await page.screenshot({
        path: path.join(auditDir, `dashboard-${vp.name}.png`),
        fullPage: true,
      });

      // Check horizontal overflow
      const dashboardScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const dashboardInnerWidth = await page.evaluate(() => window.innerWidth);
      const dashboardHasOverflow = dashboardScrollWidth > dashboardInnerWidth;

      // 5. Navigate to Transactions
      const t1 = Date.now();
      await page.goto("http://localhost:3000/transactions", { waitUntil: "networkidle" });
      const txTransitionTime = Date.now() - t1;
      await page.screenshot({
        path: path.join(auditDir, `transactions-${vp.name}.png`),
        fullPage: true,
      });
      const txScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const txHasOverflow = txScrollWidth > vp.width;

      // 6. Navigate to Budgets
      const t2 = Date.now();
      await page.goto("http://localhost:3000/budgets", { waitUntil: "networkidle" });
      const budgetsTransitionTime = Date.now() - t2;
      await page.screenshot({
        path: path.join(auditDir, `budgets-${vp.name}.png`),
        fullPage: true,
      });

      // 7. Navigate to Trips
      const t3 = Date.now();
      await page.goto("http://localhost:3000/trips", { waitUntil: "networkidle" });
      const tripsTransitionTime = Date.now() - t3;
      await page.screenshot({
        path: path.join(auditDir, `trips-${vp.name}.png`),
        fullPage: true,
      });

      // 8. Navigate to Settings
      const t4 = Date.now();
      await page.goto("http://localhost:3000/settings", { waitUntil: "networkidle" });
      const settingsTransitionTime = Date.now() - t4;
      await page.screenshot({
        path: path.join(auditDir, `settings-${vp.name}.png`),
        fullPage: true,
      });

      console.log(`[Metrics ${vp.name}]:`, {
        dashboardLoad: `${dashboardLoad}ms`,
        toTransactions: `${txTransitionTime}ms`,
        toBudgets: `${budgetsTransitionTime}ms`,
        toTrips: `${tripsTransitionTime}ms`,
        toSettings: `${settingsTransitionTime}ms`,
        dashboardHasOverflow,
        txHasOverflow,
        consoleErrorsCount: consoleErrors.length,
        consoleWarningsCount: consoleWarnings.length,
      });
    });
  }
});

