import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "xs": ["0.75rem", { lineHeight: "1.6", letterSpacing: "0" }], // 12px
        "13": ["0.8125rem", { lineHeight: "1.6", letterSpacing: "0" }], // 13px
        "sm": ["0.875rem", { lineHeight: "1.6", letterSpacing: "0" }], // 14px
        "base": ["1rem", { lineHeight: "1.6", letterSpacing: "0" }], // 16px
        "lg": ["1.125rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }], // 18px
        "xl": ["1.375rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }], // 22px
        "2xl": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }], // 28px
        "3xl": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }], // 36px
        "4xl": ["3rem", { lineHeight: "1.0", letterSpacing: "-0.02em" }], // 48px
        "5xl": ["4rem", { lineHeight: "1.0", letterSpacing: "-0.02em" }], // 64px
      },
      letterSpacing: {
        display: "-0.02em",
        heading: "-0.01em",
        body: "0",
        eyebrow: "0.04em",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--surface-foreground))",
          elevated: "hsl(var(--surface-elevated))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        income: "hsl(var(--income))",
        expense: "hsl(var(--expense))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
      },
      borderRadius: {
        hero: "28px",
        card: "20px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "glow-accent": "0 0 24px -4px rgba(52, 211, 153, 0.25)",
        "glow-rose": "0 0 24px -4px rgba(251, 113, 133, 0.2)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
