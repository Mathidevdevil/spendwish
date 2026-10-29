const { chromium } = require("@playwright/test");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });

  const fontTests = await page.evaluate(() => {
    function testGlyph(fontFamily) {
      const span = document.createElement("span");
      span.style.fontFamily = fontFamily;
      span.style.fontSize = "32px";
      span.style.visibility = "hidden";
      span.style.position = "absolute";
      span.textContent = "₹";
      document.body.appendChild(span);
      const width = span.getBoundingClientRect().width;
      const height = span.getBoundingClientRect().height;
      document.body.removeChild(span);
      return { width, height, renders: width > 0 && height > 0 };
    }

    function testTabularDigits(fontFamily) {
      const widths = [];
      for (let i = 0; i <= 9; i++) {
        const span = document.createElement("span");
        span.className = "num";
        span.style.fontFamily = fontFamily;
        span.style.fontSize = "24px";
        span.style.fontVariantNumeric = "tabular-nums";
        span.style.fontFeatureSettings = '"tnum", "cv11"';
        span.style.visibility = "hidden";
        span.style.position = "absolute";
        span.textContent = String(i);
        document.body.appendChild(span);
        widths.push(span.getBoundingClientRect().width);
        document.body.removeChild(span);
      }
      const allEqual = widths.every((w) => Math.abs(w - widths[0]) < 0.05);
      return { widths, allEqual };
    }

    return {
      interGlyph: testGlyph("var(--font-sans)"),
      soraGlyph: testGlyph("var(--font-display)"),
      monoGlyph: testGlyph("var(--font-mono)"),
      interTabularDigits: testTabularDigits("var(--font-sans)"),
      soraDigits: testTabularDigits("var(--font-display)"),
    };
  });

  console.log("GLYPH & TABULAR TESTS:", JSON.stringify(fontTests, null, 2));
  await browser.close();
}

main().catch(console.error);

