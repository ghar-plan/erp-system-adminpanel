export interface ProductLifespan {
  id?: string;
  productId: string;
  productName: string;
  years: number;
  months: number;
  days: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductLifespanAvailability {
  productId: string;
  productName: string | null;
  years: number;
  months: number;
  days: number;
  isLifetime: boolean;
}

export const formatLifespanLabel = (
  years?: number | null,
  months?: number | null,
  days?: number | null,
): string => {
  const y = Number(years) || 0;
  const m = Number(months) || 0;
  const d = Number(days) || 0;
  if (y <= 0 && m <= 0 && d <= 0) return "Lifetime";

  const parts: string[] = [];
  if (y > 0) parts.push(`${y} ${y === 1 ? "Year" : "Years"}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? "Month" : "Months"}`);
  if (d > 0) parts.push(`${d} ${d === 1 ? "Day" : "Days"}`);
  return parts.join(" ");
};

/** Add years/months/days to a YYYY-MM-DD start date → YYYY-MM-DD expiry. */
export const computeExpiryFromLifespan = (
  startDate: string,
  years: number,
  months: number,
  days: number,
): string => {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return "";

  const y = Number(years) || 0;
  const m = Number(months) || 0;
  const d = Number(days) || 0;
  if (y <= 0 && m <= 0 && d <= 0) return "";

  if (y > 0) date.setFullYear(date.getFullYear() + y);
  if (m > 0) date.setMonth(date.getMonth() + m);
  if (d > 0) date.setDate(date.getDate() + d);

  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};
