"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CurrencyCode, formatCurrency as formatCurrencyUtil } from "@/lib/utils";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  format: (amount: number | string | null | undefined, options?: { showFraction?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "INR",
  setCurrency: () => {},
  format: (amount, options) => formatCurrencyUtil(amount, "INR", options),
});

const STORAGE_KEY = "spendwise_currency_pref";

export function CurrencyProvider({
  children,
  initialCurrency = "INR",
}: {
  children: React.ReactNode;
  initialCurrency?: CurrencyCode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
    if (saved && ["INR", "USD", "EUR", "GBP"].includes(saved)) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  const format = (
    amount: number | string | null | undefined,
    options?: { showFraction?: boolean }
  ) => {
    return formatCurrencyUtil(amount, currency, options);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
