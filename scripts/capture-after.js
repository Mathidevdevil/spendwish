const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const outDir = path.join(__dirname, "..", "audit", "after");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const widths = [375, 768, 1440];

const unauthRoutes = [
  { name: "login", path: "/login" },
  { name: "signup", path: "/signup" },
];

const authRoutes = [
  { name: "dashboard", path: "/" },
  { name: "transactions", path: "/transactions" },
  { name: "budgets", path: "/budgets" },
  { name: "trips", path: "/trips" },
  { name: "settings", path: "/settings" },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Unauthenticated routes
  for (const w of widths) {
    const page = await browser.newPage({
      viewport: { width: w, height: w === 375 ? 812 : w === 768 ? 1024 : 900 },
    });
    for (const r of unauthRoutes) {
      await page.goto(`http://localhost:3000${r.path}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(500);
      const filePath = path.join(outDir, `${r.name}-${w}px.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved: ${filePath}`);
    }
    await page.close();
  }

  // 2. Authenticated routes (with demo session cookies)
  const authContext = await browser.newContext();
  await authContext.addCookies([
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

  for (const w of widths) {
    const page = await authContext.newPage();
    await page.setViewportSize({
      width: w,
      height: w === 375 ? 812 : w === 768 ? 1024 : 900,
    });

    for (const r of authRoutes) {
      await page.goto(`http://localhost:3000${r.path}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(600);
      const filePath = path.join(outDir, `${r.name}-${w}px.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved: ${filePath}`);
    }
    await page.close();
  }

  await browser.close();
  console.log("All after screenshots captured successfully!");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});

