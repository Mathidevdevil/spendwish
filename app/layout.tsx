import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/providers/pwa-register";

export const metadata: Metadata = {
  title: "Spendwise | Personal Finance & Travel Tracker",
  description:
    "Production-quality personal finance and travel budget tracker with Indian number formatting, smart AI entry, and database-level analytics.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Spendwise",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased min-h-[100dvh] bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <CurrencyProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
              <PwaRegister />
            </CurrencyProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
