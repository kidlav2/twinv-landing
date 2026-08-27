import type { CurrencyCode } from "./types";

const SYMBOL: Record<CurrencyCode, string> = {
  CAD: "CA$",
  USD: "US$",
  EUR: "€",
  GBP: "£",
};

export function money(amount: number, currency: CurrencyCode | string): string {
  const code = currency as CurrencyCode;
  try {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: SYMBOL[code] ? code : "CAD",
      currencyDisplay: "narrowSymbol",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function pctLabel(n: number): string {
  const t = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
  return `${t}%`;
}

export function shareLabel(a: number): string {
  return `${Math.round(a * 100)}/${Math.round((1 - a) * 100)}`;
}
