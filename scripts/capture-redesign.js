const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const outDir = path.join(__dirname, "..", "audit", "redesign");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const targetPageArg = process.argv[2] || "login";
const widths = [390, 768, 1440];
const themes = ["dark", "light"];

const pageRoutes = {
  login: { path: "/login", isAuth: false },
  signup: { path: "/signup", isAuth: false },
  dashboard: { path: "/", isAuth: true },
  transactions: { path: "/transactions", isAuth: true },
  budgets: { path: "/budgets", isAuth: true },
  trips: { path: "/trips", isAuth: true },
  "trip-detail": { path: "/trips/trip-1", isAuth: true },
  settings: { path: "/settings", isAuth: true },
};

async function main() {
  const browser = await chromium.launch({ headless: true });

  const pagesToCapture =
    targetPageArg === "all"
      ? Object.keys(pageRoutes)
      : targetPageArg.split(",");

  for (const pageKey of pagesToCapture) {
    const config = pageRoutes[pageKey];
    if (!config) {
      console.warn(`Unknown page: ${pageKey}`);
      continue;
    }

    console.log(`\nCapturing screenshots for: ${pageKey}`);

    for (const theme of themes) {
      for (const width of widths) {
        const height = width === 390 ? 844 : width === 768 ? 1024 : 900;
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
        });

        if (config.isAuth) {
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

        const page = await context.newPage();
        await page.goto(`http://localhost:3000${config.path}`, {
          waitUntil: "networkidle",
        });

        // Set the HTML class for theme
        await page.evaluate((t) => {
          const root = document.documentElement;
          if (t === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
          } else {
            root.classList.add("light");
            root.classList.remove("dark");
          }
        }, theme);

        await page.waitForTimeout(400);

        const fileName = `${pageKey}-${width}px-${theme}.png`;
        const filePath = path.join(outDir, fileName);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Saved: audit/redesign/${fileName}`);

        await page.close();
        await context.close();
      }
    }
  }

  await browser.close();
  console.log("Screenshots captured successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

