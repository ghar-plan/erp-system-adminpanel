import { CashOutPaymentSource } from "@/utils/helpers/models/cashflow/cashflow.dto";
import { CustomerTypeCategory } from "@/utils/helpers/models/customer-types/customer-type.dto";
import { roundMoney } from "@/utils/helpers/money";
import { formatSkuLabel } from "@/utils/helpers/models/product-sku";

export interface SaleItem {
  id?: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  quantity: number;
  rate: number;
  lineTotal?: number;
  sortOrder?: number;
}

export const formatSaleBrandsLabel = (sale: {
  items?: SaleItem[];
}): string => {
  const names = Array.from(
    new Set(
      (sale.items || [])
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

export enum PaymentCollectedBy {
  ADMIN = "admin",
  PICKUP_POINT = "pickup_point",
}

export enum PickupRemittanceStatus {
  NOT_APPLICABLE = "not_applicable",
  PENDING = "pending",
  SETTLED = "settled",
}

export const COMMERCE_ENTRY_STATUS_OPTIONS = [
  { value: CommerceEntryStatus.DRAFT, label: "Draft" },
  { value: CommerceEntryStatus.POSTED, label: "Posted" },
];

export const PAYMENT_COLLECTED_BY_OPTIONS = [
  {
    value: PaymentCollectedBy.ADMIN,
    label: "Collected by Admin (Ghar Plans)",
  },
  {
    value: PaymentCollectedBy.PICKUP_POINT,
    label: "Collected at Pickup Point",
  },
];

export interface Sale {
  id: string;
  customerTypeId: string;
  customerType?: {
    id: string;
    name: string;
    category: CustomerTypeCategory;
  };
  date: string;
  customerName?: string | null;
  telephone?: string | null;
  /** Denormalized summary (first product / "Name + N more") */
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  rate: number;
  payment: number;
  balance: number;
  sourcePayment: CashOutPaymentSource;
  paymentCollectedBy?: PaymentCollectedBy | string;
  remittanceStatus?: PickupRemittanceStatus | string;
  remittedAmount?: number | null;
  remittedAt?: string | null;
  remittedBy?: string | null;
  remittanceNotes?: string | null;
  status?: CommerceEntryStatus | string;
  remarks?: string | null;
  items?: SaleItem[];
  created_at?: string;
  updated_at?: string;
}

export const isDraftEntry = (
  status?: CommerceEntryStatus | string | null,
): boolean => status === CommerceEntryStatus.DRAFT || status === "draft";

export const computeLineTotal = (
  quantity: number | string,
  rate: number | string,
): number => {
  const qty = Number(quantity) || 0;
  const r = Number(rate) || 0;
  return roundMoney(qty * r);
};

export const computeSaleSubtotal = (
  items: Array<{ quantity?: number | string; rate?: number | string }>,
): number => {
  return roundMoney(
    items.reduce(
      (sum, item) => sum + computeLineTotal(item.quantity ?? 0, item.rate ?? 0),
      0,
    ),
  );
};

export const computeSaleBalanceFromItems = (
  items: Array<{ quantity?: number | string; rate?: number | string }>,
  payment: number | string,
): number => {
  const subtotal = computeSaleSubtotal(items);
  const p = Number.isFinite(Number(payment)) ? Number(payment) : 0;
  return roundMoney(subtotal - p);
};

/**
 * Resolve payment from Source Payment + subtotal.
 * Cash → full; Credit → 0; Partial/Advance → keep entered amount (default 0).
 */
export const resolveSalePayment = (
  sourcePayment: CashOutPaymentSource | string | "",
  subtotal: number,
  enteredPayment?: number | string | null,
): number => {
  const total = roundMoney(Number(subtotal) || 0);
  const entered = Number(enteredPayment);
  const safeEntered = Number.isFinite(entered) ? roundMoney(entered) : 0;

  switch (sourcePayment) {
    case CashOutPaymentSource.CASH:
      return total;
    case CashOutPaymentSource.CREDIT:
      return 0;
    case CashOutPaymentSource.PARTIAL:
    case CashOutPaymentSource.ADVANCE:
      return Math.max(0, safeEntered);
    default:
      return Math.max(0, safeEntered);
  }
};

/** @deprecated Prefer computeSaleBalanceFromItems for multi-product sales */
export const computeSaleBalance = (
  quantity: number | string,
  rate: number | string,
  payment: number | string,
): number => {
  const qty = Number(quantity) || 0;
  const r = Number(rate) || 0;
  const p = Number(payment) || 0;
  return roundMoney(qty * r - p);
};

export const formatSaleProductsLabel = (sale: Sale): string => {
  if (sale.items && sale.items.length > 1) {
    const first = sale.items[0];
    return `${formatSkuLabel(first.productName, first.variantName)} + ${sale.items.length - 1} more`;
  }
  if (sale.items && sale.items.length === 1) {
    const only = sale.items[0];
    return formatSkuLabel(only.productName, only.variantName);
  }
  return sale.productName
    ? formatSkuLabel(sale.productName, sale.variantName)
    : "--";
};
