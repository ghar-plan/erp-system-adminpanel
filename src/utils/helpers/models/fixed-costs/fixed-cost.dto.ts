export enum FixedCostCategory {
  WAREHOUSE_RENT = "warehouse_rent",
  ELECTRICITY_BILLS = "electricity_bills",
}

export enum FixedCostPaymentType {
  MONTHLY = "monthly",
  ONE_TIME = "one_time",
}

export const FIXED_COST_CATEGORY_OPTIONS = [
  { value: FixedCostCategory.WAREHOUSE_RENT, label: "Warehouse Rent" },
  { value: FixedCostCategory.ELECTRICITY_BILLS, label: "Electricity Bills" },
] as const;

export const FIXED_COST_PAYMENT_TYPE_OPTIONS = [
  { value: FixedCostPaymentType.MONTHLY, label: "Monthly" },
  { value: FixedCostPaymentType.ONE_TIME, label: "One-time" },
] as const;

export interface FixedCostMedia {
  id: string;
  url?: string;
  mime_type?: string;
}

export interface FixedCost {
  id: string;
  category: FixedCostCategory;
  paymentType: FixedCostPaymentType;
  amount: number;
  date: string;
  remarks?: string | null;
  mediaId?: string | null;
  media?: FixedCostMedia | null;
  created_at?: string;
  updated_at?: string;
}

export const getCategoryLabel = (category?: string | null): string => {
  const match = FIXED_COST_CATEGORY_OPTIONS.find((o) => o.value === category);
  return match?.label ?? category ?? "--";
};

export const getPaymentTypeLabel = (paymentType?: string | null): string => {
  const match = FIXED_COST_PAYMENT_TYPE_OPTIONS.find(
    (o) => o.value === paymentType,
  );
  return match?.label ?? paymentType ?? "--";
};

export const formatMoney = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") return "--";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "--";
  return `PKR ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
