import {
  CashOutPaymentSource,
  CASH_OUT_PAYMENT_SOURCE_OPTIONS,
} from "@/utils/helpers/models/cashflow/cashflow.dto";

// Re-export so purchase/sales screens can import a single, semantically named
// source-of-truth without reaching into the cashflow module directly.
export { CashOutPaymentSource };
export const SOURCE_PAYMENT_OPTIONS = CASH_OUT_PAYMENT_SOURCE_OPTIONS;

export interface PurchaseItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  rate?: number | null;
  lineTotal?: number | null;
  expiryDate?: string | null;
  sortOrder?: number;
}

export interface Purchase {
  id: string;
  supplierName: string;
  /** Denormalized summary (first product / "Name + N more") */
  productId: string;
  productName: string;
  quantity: number;
  rate?: number | null;
  paymentMade?: number | null;
  remarks?: string | null;
  sourcePayment: CashOutPaymentSource;
  expiryDate?: string | null;
  date: string;
  items?: PurchaseItem[];
  created_at?: string;
  updated_at?: string;
}

export const formatPurchaseProductsLabel = (purchase: Purchase): string => {
  if (purchase.items && purchase.items.length > 1) {
    return `${purchase.items[0].productName} + ${purchase.items.length - 1} more`;
  }
  if (purchase.items && purchase.items.length === 1) {
    return purchase.items[0].productName;
  }
  return purchase.productName || "--";
};

export const computePurchaseLineTotal = (
  quantity: number | string,
  rate?: number | string | null,
): number | null => {
  if (rate === null || rate === undefined || rate === "") return null;
  const qty = Number(quantity) || 0;
  const r = Number(rate);
  if (!Number.isFinite(r)) return null;
  return Math.round(qty * r * 100) / 100;
};

export interface GharplansProductVariant {
  price: number;
  [key: string]: any;
}

export interface GharplansProduct {
  id: number | string;
  name: string;
  variants?: GharplansProductVariant[];
  [key: string]: any;
}

/** First/lowest variant price for a Ghar Plans product, or null if unavailable. */
export const getProductDefaultPrice = (
  product?: GharplansProduct | null,
): number | null => {
  const price = product?.variants?.[0]?.price;
  return price !== undefined && price !== null ? Number(price) : null;
};

export { formatMoney, formatMoneyNumber, parseMoney, toMoneyNumber } from "@/utils/helpers/money";
