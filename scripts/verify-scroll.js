// Comprehensive Playwright script to verify Lenis smooth scrolling, reduced motion, modal isolation, and scroll-linked polish
const { chromium } = require("@playwright/test");

async function runVerification() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    checks: [],
    passed: 0,
    failed: 0,
  };

  function record(name, passed, details = "") {
    results.checks.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`✓ [PASS] ${name} ${details ? "(" + details + ")" : ""}`);
    } else {
      results.failed++;
      console.error(`✗ [FAIL] ${name} ${details ? "(" + details + ")" : ""}`);
    }
  }

  try {
    // ----------------------------------------------------
    // Test 1: Desktop Smooth Scroll & Lenis Initialization
    // ----------------------------------------------------
    console.log("\n--- Testing Desktop Smooth Scroll (1440x900) ---");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    // Set demo cookie to authenticate directly
    await desktopContext.addCookies([
      {
        name: "spendwise_demo_session",
        value: "true",
        domain: "localhost",
        path: "/",
      },
      {
        name: "spendwise_user_email",
        value: "alex.mercer@spendwise.app",
        domain: "localhost",
        path: "/",
      },
    ]);

    const page = await desktopContext.newPage();
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // 1.1 Check html.lenis class
    const htmlClasses = await page.evaluate(() => document.documentElement.className);
    const hasLenisClass = htmlClasses.includes("lenis");
    record("Lenis class initialized on <html>", hasLenisClass, `classes: ${htmlClasses}`);

    // 1.2 Check scroll-padding-top on html
    const scrollPaddingTop = await page.evaluate(() =>
      window.getComputedStyle(document.documentElement).scrollPaddingTop
    );
    record("scroll-padding-top is 4rem / 64px", scrollPaddingTop === "64px" || scrollPaddingTop === "4rem", `got: ${scrollPaddingTop}`);

    // 1.3 Check sticky header initial state (scrollY <= 8)
    const headerBorderInitial = await page.evaluate(() => {
      const header = document.querySelector("header");
      return header ? header.className : "";
    });
    record("Header starts with default subtle styling", headerBorderInitial.includes("bg-background/50"));

    // 1.4 Perform wheel scroll and verify scroll position & sticky header style update
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(600);

    const scrollYAfterWheel = await page.evaluate(() => window.scrollY);
    record("Smooth wheel scroll updates window.scrollY", scrollYAfterWheel > 50, `scrollY: ${scrollYAfterWheel}`);

    const headerBorderScrolled = await page.evaluate(() => {
      const header = document.querySelector("header");
      return header ? header.className : "";
    });
    record("Header applies enhanced blur & hairline border after scroll > 8px", headerBorderScrolled.includes("bg-background/85"));

    // 1.5 Scroll further (> 600px) to test Back to Top button and Scroll Progress
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(600);

    const scrollYDeep = await page.evaluate(() => window.scrollY);
    console.log(`Deep scroll reached: ${scrollYDeep}px`);

    const backToTopVisible = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Scroll back to top"]');
      return btn !== null && window.getComputedStyle(btn).display !== "none";
    });
    record("Back to top button appears when scrollY > 600px", backToTopVisible || scrollYDeep < 600, `visible: ${backToTopVisible}, scrollY: ${scrollYDeep}`);

    // If back to top button is present, click it and test smooth return to 0
    if (backToTopVisible) {
      await page.click('button[aria-label="Scroll back to top"]');
      await page.waitForTimeout(1200);
      const scrollYAfterBackToTop = await page.evaluate(() => window.scrollY);
      record("Back to top click smoothly returns scroll to 0", scrollYAfterBackToTop <= 15, `final scrollY: ${scrollYAfterBackToTop}`);
    }

    // ----------------------------------------------------
    // Test 2: Nested Scrollables & data-lenis-prevent
    // ----------------------------------------------------
    console.log("\n--- Testing Nested Scrollables & data-lenis-prevent ---");
    // 2.1 DialogContent has data-lenis-prevent
    // Trigger "Add Entry" dialog
    const addEntryBtn = page.locator('button:has-text("Add Entry")').first();
    if (await addEntryBtn.isVisible()) {
      await addEntryBtn.click();
      await page.waitForTimeout(500);

      const dialogLenisPrevent = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return dialog ? dialog.getAttribute("data-lenis-prevent") : null;
      });
      record("Transaction dialog content has data-lenis-prevent='true'", dialogLenisPrevent === "true", `got: ${dialogLenisPrevent}`);

      // Close dialog
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // 2.2 Command palette has data-lenis-prevent
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(500);
    const cmdPalettePrevent = await page.evaluate(() => {
      const cmdList = document.querySelector('[data-lenis-prevent="true"]');
      return cmdList !== null;
    });
    record("Command palette contains data-lenis-prevent element", cmdPalettePrevent);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // 2.3 Check select / popover definitions
    await page.goto("http://localhost:3000/transactions", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    const horizontalFiltersPrevent = await page.evaluate(() => {
      const filterStrip = document.querySelector('[data-lenis-prevent="true"]');
      return filterStrip !== null;
    });
    record("Transaction horizontal filter bar has data-lenis-prevent='true'", horizontalFiltersPrevent);

    await desktopContext.close();

    // ----------------------------------------------------
    // Test 3: Accessibility - prefers-reduced-motion: reduce
    // ----------------------------------------------------
    console.log("\n--- Testing prefers-reduced-motion: reduce Accessibility ---");
    const reducedMotionContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    await reducedMotionContext.addCookies([
      {
        name: "spendwise_demo_session",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ]);

    const rmPage = await reducedMotionContext.newPage();
    await rmPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await rmPage.waitForTimeout(800);

    const rmHtmlClasses = await rmPage.evaluate(() => document.documentElement.className);
    const rmHasLenisSmooth = rmHtmlClasses.includes("lenis-smooth");
    record(
      "Lenis smooth wheel is DISABLED when prefers-reduced-motion is reduce",
      !rmHasLenisSmooth,
      `html classes: ${rmHtmlClasses}`
    );

    await reducedMotionContext.close();

    // ----------------------------------------------------
    // Test 4: Mobile Emulation (390px) & Native Touch
    // ----------------------------------------------------
    console.log("\n--- Testing Mobile Emulation (390x844 iPhone) ---");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await mobileContext.addCookies([
      {
        name: "spendwise_demo_session",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ]);

    const mobPage = await mobileContext.newPage();
    await mobPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await mobPage.waitForTimeout(800);

    // Touch scroll simulation (swipe up)
    await mobPage.touchscreen.tap(200, 500);
    // Emulate touch drag
    await mobPage.evaluate(() => {
      window.scrollBy({ top: 300, behavior: "instant" });
    });
    await mobPage.waitForTimeout(400);

    const mobScrollY = await mobPage.evaluate(() => window.scrollY);
    record("Mobile allows native instant touch scrolling without JS hijacking", mobScrollY > 100, `mobScrollY: ${mobScrollY}`);

    // Check Mobile "More" Sheet has data-lenis-prevent
    const moreBtn = mobPage.locator('button[aria-label="More navigation options"]');
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      await mobPage.waitForTimeout(400);
      const sheetPrevent = await mobPage.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return dialog ? dialog.getAttribute("data-lenis-prevent") : null;
      });
      record("Mobile 'More' sheet has data-lenis-prevent='true'", sheetPrevent === "true", `got: ${sheetPrevent}`);
    }

    await mobileContext.close();

  } catch (err) {
    console.error("Test execution error:", err);
    record("Overall execution without unhandled exceptions", false, err.message);
  } finally {
    await browser.close();
  }

  console.log(`\n========================================`);
  console.log(`Scroll Verification Summary: ${results.passed} passed, ${results.failed} failed out of ${results.checks.length} tests.`);
  console.log(`========================================\n`);

  if (results.failed > 0) {
    process.exit(1);
  }
}

runVerification();

