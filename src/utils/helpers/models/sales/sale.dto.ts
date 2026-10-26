import { CashOutPaymentSource } from "@/utils/helpers/models/cashflow/cashflow.dto";
import { CustomerTypeCategory } from "@/utils/helpers/models/customer-types/customer-type.dto";

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
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  payment: number;
  balance: number;
  sourcePayment: CashOutPaymentSource;
  remarks?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const computeSaleBalance = (
  quantity: number | string,
  rate: number | string,
  payment: number | string,
): number => {
  const qty = Number(quantity) || 0;
  const r = Number(rate) || 0;
  const p = Number(payment) || 0;
  return Math.round(qty * r - p);
};
