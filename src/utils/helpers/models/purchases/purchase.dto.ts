import {
  CashOutPaymentSource,
  CASH_OUT_PAYMENT_SOURCE_OPTIONS,
} from "@/utils/helpers/models/cashflow/cashflow.dto";

import { formatSkuLabel } from "@/utils/helpers/models/product-sku";

// Re-export so purchase/sales screens can import a single, semantically named
// source-of-truth without reaching into the cashflow module directly.
export { CashOutPaymentSource };
export const SOURCE_PAYMENT_OPTIONS = CASH_OUT_PAYMENT_SOURCE_OPTIONS;

export interface PurchaseItem {
  id?: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  quantity: number;
  rate?: number | null;
  lineTotal?: number | null;
  expiryDate?: string | null;
  sortOrder?: number;
}

export const formatPurchaseBrandsLabel = (purchase: {
  items?: PurchaseItem[];
}): string => {
  const names = Array.from(
    new Set(
      (purchase.items || [])
        .map((item) => item.brandName?.trim())
        .filter((name): name is string => !!name),
    ),
  );
  if (!names.length) return "--";
  if (names.length === 1) return names[0];
  return `${names[0]} + ${names.length - 1} more`;
};

export enum CommerceEntryStatus {
  DRAFT = "draft",
  POSTED = "posted",
}

export const COMMERCE_ENTRY_STATUS_OPTIONS = [
  { value: CommerceEntryStatus.DRAFT, label: "Draft" },
  { value: CommerceEntryStatus.POSTED, label: "Posted" },
];

export interface Purchase {
  id: string;
  supplierName: string;
  /** Denormalized summary (first product / "Name + N more") */
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  rate?: number | null;
  paymentMade?: number | null;
  remarks?: string | null;
  sourcePayment: CashOutPaymentSource;
  status?: CommerceEntryStatus | string;
  expiryDate?: string | null;
  date: string;
  items?: PurchaseItem[];
  created_at?: string;
  updated_at?: string;
}

export const isDraftEntry = (
  status?: CommerceEntryStatus | string | null,
): boolean => status === CommerceEntryStatus.DRAFT || status === "draft";

export const formatPurchaseProductsLabel = (purchase: Purchase): string => {
  if (purchase.items && purchase.items.length > 1) {
    const first = purchase.items[0];
    return `${formatSkuLabel(first.productName, first.variantName)} + ${purchase.items.length - 1} more`;
  }
  if (purchase.items && purchase.items.length === 1) {
    const only = purchase.items[0];
    return formatSkuLabel(only.productName, only.variantName);
  }
  return purchase.productName
    ? formatSkuLabel(purchase.productName, purchase.variantName)
    : "--";
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
