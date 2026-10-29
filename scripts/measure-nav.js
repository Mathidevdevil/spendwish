const { chromium } = require("@playwright/test");

async function measureNavigation() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

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

  // Cold load
  const t0 = Date.now();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const coldLoadTime = Date.now() - t0;
  console.log(`Cold Load (Dashboard): ${coldLoadTime}ms`);

  // Nav to Transactions
  const t1 = Date.now();
  await page.click('a[href="/transactions"]');
  await page.waitForSelector("table, .cursor-pointer");
  const toTransactions = Date.now() - t1;
  console.log(`Dashboard -> Transactions: ${toTransactions}ms`);

  // Nav to Budgets
  const t2 = Date.now();
  await page.click('a[href="/budgets"]');
  await page.waitForSelector("h1");
  const toBudgets = Date.now() - t2;
  console.log(`Transactions -> Budgets: ${toBudgets}ms`);

  // Nav to Trips
  const t3 = Date.now();
  await page.click('a[href="/trips"]');
  await page.waitForSelector("h1");
  const toTrips = Date.now() - t3;
  console.log(`Budgets -> Trips: ${toTrips}ms`);

  // Nav to Settings
  const t4 = Date.now();
  await page.goto("http://localhost:3000/settings", {
    waitUntil: "networkidle",
  });
  const toSettings = Date.now() - t4;
  console.log(`Direct/Nav to Settings: ${toSettings}ms`);

  await browser.close();
}

measureNavigation().catch(console.error);

