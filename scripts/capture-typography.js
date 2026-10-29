const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const outputDir = path.join(__dirname, "../audit/typography");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const routes = [
  { name: "login", path: "/login", isPublic: true },
  { name: "dashboard", path: "/", isPublic: false },
  { name: "transactions", path: "/transactions", isPublic: false },
  { name: "budgets", path: "/budgets", isPublic: false },
  { name: "trips", path: "/trips", isPublic: false },
  { name: "trip-detail", path: "/trips/trip-1", isPublic: false },
  { name: "settings", path: "/settings", isPublic: false },
];

const viewports = [
  { label: "390px", width: 390, height: 844 },
  { label: "1440px", width: 1440, height: 900 },
];

const themes = ["dark", "light"];

async function main() {
  const browser = await chromium.launch({ headless: true });

  for (const theme of themes) {
    for (const vp of viewports) {
      console.log(`\nCapturing ${vp.label} in ${theme} mode...`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });

      // Inject demo session cookies
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

      const page = await context.newPage();

      for (const route of routes) {
        if (route.isPublic) {
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
              value: "Aarav Sharma",
              domain: "localhost",
              path: "/",
            },
          ]);
        }

        await page.goto(`http://localhost:3000${route.path}`, {
          waitUntil: "networkidle",
        });
        await page.waitForTimeout(600);

        // Apply theme to document element
        await page.evaluate((t) => {
          const html = document.documentElement;
          if (t === "dark") {
            html.classList.add("dark");
            html.classList.remove("light");
          } else {
            html.classList.remove("dark");
            html.classList.add("light");
          }
          localStorage.setItem("theme", t);
        }, theme);

        await page.waitForTimeout(400);

        const filename = `${route.name}-${vp.label}-${theme}.png`;
        const filepath = path.join(outputDir, filename);
        await page.screenshot({ path: filepath, fullPage: false });
        console.log(`Saved screenshot: ${filename}`);
      }

      await context.close();
    }
  }

  await browser.close();
  console.log("\nAll typography verification screenshots captured successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
