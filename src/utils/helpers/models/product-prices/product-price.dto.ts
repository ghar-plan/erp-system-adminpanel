export interface ProductPrice {
  id: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  /** ERP cost (per item). */
  rate: number;
  /** Gharplans selling price snapshot at last save. */
  sellingPrice?: number | null;
  effectiveFrom: string | Date;
  created_at?: string;
  updated_at?: string;
}

/**
 * Margin % from website selling price vs cost:
 * (sellingPrice − cost) × 100 / cost
 * Selling = Gharplans website price; cost = ERP rate (or GP cost when provided).
 */
export const computeMarginPercent = (
  sellingPrice?: number | string | null,
  cost?: number | string | null,
): number | null => {
  const price = Number(sellingPrice);
  const productCost = Number(cost);
  if (!Number.isFinite(price) || !Number.isFinite(productCost) || productCost <= 0) {
    return null;
  }
  return Math.round(((price - productCost) * 10000) / productCost) / 100;
};

export const formatMarginPercent = (
  sellingPrice?: number | string | null,
  cost?: number | string | null,
): string => {
  const margin = computeMarginPercent(sellingPrice, cost);
  if (margin === null) return "—";
  const sign = margin > 0 ? "+" : "";
  return `${sign}${margin.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
};

export interface ProductPriceHistory {
  id: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  /** ERP cost (per item) for this period. */
  rate: number;
  /** Gharplans selling price snapshot for this period. */
  sellingPrice?: number | null;
  effectiveFrom: string | Date;
  effectiveTo?: string | Date | null;
  created_at?: string;
}
