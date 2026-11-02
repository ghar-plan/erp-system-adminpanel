/**
 * PKR money helpers — amounts support up to 2 decimal places (paisa).
 */

const MONEY_SCALE = 100;

/** Round to 2 decimal places (half-up). */
export const roundMoney = (value: number): number => {
  if (!Number.isFinite(value)) return NaN;
  return Math.round(value * MONEY_SCALE) / MONEY_SCALE;
};

/** Parse money from number/string (allows commas) and round to 2 decimals. */
export const parseMoney = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? roundMoney(value) : NaN;
  }
  if (value === null || value === undefined) return NaN;
  const cleaned = String(value).replace(/,/g, "").trim();
  if (!cleaned) return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? roundMoney(n) : NaN;
};

/** Multiply qty × unit (or two money values) and round to 2 decimals. */
export const multiplyMoney = (a: unknown, b: unknown): number => {
  const x =
    typeof a === "string" ? Number(String(a).replace(/,/g, "").trim()) : Number(a);
  const y =
    typeof b === "string" ? Number(String(b).replace(/,/g, "").trim()) : Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return NaN;
  return roundMoney(x * y);
};

/** Divide total by qty and round to 2 decimals. */
export const divideMoney = (total: unknown, qty: unknown): number => {
  const t = parseMoney(total);
  const q = Number(qty);
  if (!Number.isFinite(t) || !Number.isFinite(q) || q === 0) return NaN;
  return roundMoney(t / q);
};

/** Normalize a value to a 2-decimal amount for API payloads. */
export const toMoneyNumber = (value: unknown): number => {
  const n = parseMoney(value);
  return Number.isFinite(n) ? n : NaN;
};

/** Display PKR amounts (up to 2 decimals; trailing zeros omitted when whole). */
export const formatMoney = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") return "--";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "--";
  const rounded = roundMoney(amount);
  const isWhole = Math.abs(rounded - Math.round(rounded)) < 1e-9;
  return `PKR ${rounded.toLocaleString("en-US", {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Locale string for a money number (no currency prefix). */
export const formatMoneyNumber = (value?: number | string | null): string => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  const rounded = roundMoney(amount);
  const isWhole = Math.abs(rounded - Math.round(rounded)) < 1e-9;
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  });
};
