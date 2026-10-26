/**
 * Whole-number (integer) money helpers for display and entry.
 * All PKR amounts are stored/shown without decimal places.
 */

/** Parse money from number/string (allows commas) and round to a whole number. */
export const parseMoney = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value) : NaN;
  }
  if (value === null || value === undefined) return NaN;
  const cleaned = String(value).replace(/,/g, "").trim();
  if (!cleaned) return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

/** Multiply qty × unit (or two money values) and round to a whole number. */
export const multiplyMoney = (a: unknown, b: unknown): number => {
  const x =
    typeof a === "string" ? Number(String(a).replace(/,/g, "").trim()) : Number(a);
  const y =
    typeof b === "string" ? Number(String(b).replace(/,/g, "").trim()) : Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return NaN;
  return Math.round(x * y);
};

/** Divide total by qty and round to a whole number. */
export const divideMoney = (total: unknown, qty: unknown): number => {
  const t = parseMoney(total);
  const q = Number(qty);
  if (!Number.isFinite(t) || !Number.isFinite(q) || q === 0) return NaN;
  return Math.round(t / q);
};

/** Normalize a value to a whole-number amount for API payloads. */
export const toMoneyNumber = (value: unknown): number => {
  const n = parseMoney(value);
  return Number.isFinite(n) ? n : NaN;
};

/** Display PKR amounts with no decimal places. */
export const formatMoney = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") return "--";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "--";
  return `PKR ${Math.round(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/** Locale string for a money number (no currency prefix, no decimals). */
export const formatMoneyNumber = (value?: number | string | null): string => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  return Math.round(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
