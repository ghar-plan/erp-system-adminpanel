import {
  CashOutPaymentSource,
  CASH_OUT_PAYMENT_SOURCE_OPTIONS,
} from "@/utils/helpers/models/cashflow/cashflow.dto";

// Re-export so purchase/sales screens can import a single, semantically named
// source-of-truth without reaching into the cashflow module directly.
export { CashOutPaymentSource };
export const SOURCE_PAYMENT_OPTIONS = CASH_OUT_PAYMENT_SOURCE_OPTIONS;

export interface Purchase {
  id: string;
  supplierName: string;
  productId: string;
  productName: string;
  quantity: number;
  rate?: number | null;
  paymentMade?: number | null;
  remarks?: string | null;
  sourcePayment: CashOutPaymentSource;
  expiryDate?: string | null;
  date: string;
  created_at?: string;
  updated_at?: string;
}

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
