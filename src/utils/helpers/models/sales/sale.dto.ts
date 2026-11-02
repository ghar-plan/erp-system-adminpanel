import { CashOutPaymentSource } from "@/utils/helpers/models/cashflow/cashflow.dto";
import { CustomerTypeCategory } from "@/utils/helpers/models/customer-types/customer-type.dto";
import { roundMoney } from "@/utils/helpers/money";

export interface SaleItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  lineTotal?: number;
  sortOrder?: number;
}

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
  quantity: number;
  rate: number;
  payment: number;
  balance: number;
  sourcePayment: CashOutPaymentSource;
  remarks?: string | null;
  items?: SaleItem[];
  created_at?: string;
  updated_at?: string;
}

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
    return `${sale.items[0].productName} + ${sale.items.length - 1} more`;
  }
  if (sale.items && sale.items.length === 1) {
    return sale.items[0].productName;
  }
  return sale.productName || "--";
};
