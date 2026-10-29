const { chromium } = require("@playwright/test");

const viewports = [
  { width: 360, height: 800, label: "360px" },
  { width: 390, height: 844, label: "390px" },
  { width: 768, height: 1024, label: "768px" },
  { width: 1024, height: 768, label: "1024px" },
  { width: 1440, height: 900, label: "1440px" },
];

const routes = [
  { path: "/login", name: "login" },
  { path: "/", name: "dashboard" },
  { path: "/transactions", name: "transactions" },
  { path: "/budgets", name: "budgets" },
  { path: "/trips", name: "trips" },
  { path: "/settings", name: "settings" },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  console.log("=== VERIFYING MOBILE RESPONSIVENESS AND OVERFLOW ===");

  // Set demo cookies
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
      value: "Demo User",
      domain: "localhost",
      path: "/",
    },
  ]);

  const page = await context.newPage();
  let anyOverflow = false;

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    console.log(`\n--- Viewport: ${vp.label} (${vp.width}x${vp.height}) ---`);

    for (const route of routes) {
      if (route.name === "login") {
        await context.clearCookies();
      } else {
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
            value: "Demo User",
            domain: "localhost",
            path: "/",
          },
        ]);
      }

      await page.goto(`http://localhost:3000${route.path}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(500);

      const metrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
        const innerWidth = window.innerWidth;
        const hasOverflow = scrollWidth > innerWidth + 1; // 1px threshold for sub-pixel rounding
        return {
          scrollWidth,
          innerWidth,
          hasOverflow,
        };
      });

      if (metrics.hasOverflow) {
        anyOverflow = true;
        console.error(
          `❌ OVERFLOW on ${route.name} at ${vp.label}: scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`
        );
      } else {
        console.log(
          `✅ ${route.name.padEnd(14)} at ${vp.label}: scrollWidth=${metrics.scrollWidth} <= ${metrics.innerWidth}`
        );
      }
    }
  }

  // Also check mobile bottom nav and center quick add button at 360px
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const bottomNavVisible = await page
    .locator('nav[aria-label="Mobile Bottom Navigation"]')
    .isVisible();
  const quickAddVisible = await page
    .locator('button[aria-label="Quick Add Transaction"]')
    .isVisible();
  const desktopSidebarHidden = !(await page.locator("aside").isVisible());

  console.log("\n--- Mobile Navigation Verification at 360px ---");
  console.log(
    `Mobile Bottom Nav visible: ${bottomNavVisible ? "✅ YES" : "❌ NO"}`
  );
  console.log(
    `Center Quick-Add Action visible: ${quickAddVisible ? "✅ YES" : "❌ NO"}`
  );
  console.log(
    `Desktop Sidebar hidden: ${desktopSidebarHidden ? "✅ YES" : "❌ NO"}`
  );

  await browser.close();

  if (anyOverflow) {
    console.error("\n❌ Found overflow issues!");
    process.exit(1);
  } else {
    console.log(
      "\n🎉 ALL ROUTES PASSED ZERO HORIZONTAL OVERFLOW AT ALL VIEWPORTS!"
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

