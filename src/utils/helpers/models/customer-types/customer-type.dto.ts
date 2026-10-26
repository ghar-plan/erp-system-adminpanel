export enum CustomerTypeCategory {
  PICKUP_POINT = "pickup_point",
  GP_CONSTRUCTION = "gp_construction",
  CUSTOMER = "customer",
  WALK_IN = "walk_in",
}

/** Fixed id for the static Walk-in Customers option on Record Sale (keep in sync with backend). */
export const WALK_IN_CUSTOMER_TYPE_ID = "a1111111-1111-4111-8111-111111111111";
export const WALK_IN_CUSTOMER_TYPE_NAME = "Walk-in Customers";

export const WALK_IN_CUSTOMER_TYPE: CustomerType = {
  id: WALK_IN_CUSTOMER_TYPE_ID,
  name: WALK_IN_CUSTOMER_TYPE_NAME,
  category: CustomerTypeCategory.WALK_IN,
};

export const CUSTOMER_TYPE_CATEGORY_OPTIONS: { value: CustomerTypeCategory; label: string }[] = [
  { value: CustomerTypeCategory.CUSTOMER, label: "Customer" },
  { value: CustomerTypeCategory.GP_CONSTRUCTION, label: "GP Construction" },
  { value: CustomerTypeCategory.PICKUP_POINT, label: "Pickup Point" },
];

export const customerTypeCategoryLabel = (category?: string | null): string => {
  switch (category) {
    case CustomerTypeCategory.PICKUP_POINT:
      return "Pickup Point";
    case CustomerTypeCategory.GP_CONSTRUCTION:
      return "GP Construction";
    case CustomerTypeCategory.CUSTOMER:
      return "Customer";
    case CustomerTypeCategory.WALK_IN:
      return "Walk-in Customers";
    default:
      return category || "--";
  }
};

export const getCustomerTypeCategoryBadgeClass = (category?: string | null): string => {
  switch (category) {
    case CustomerTypeCategory.PICKUP_POINT:
      return "bg-info-bg text-info-text border border-panel-border";
    case CustomerTypeCategory.GP_CONSTRUCTION:
      return "bg-accent-bg text-accent-text border border-panel-border";
    case CustomerTypeCategory.CUSTOMER:
      return "bg-success-bg text-success-text border border-panel-border";
    case CustomerTypeCategory.WALK_IN:
      return "bg-warning-bg text-warning-text border border-panel-border";
    default:
      return "bg-panel-bg text-muted-foreground border border-panel-border";
  }
};

export interface CustomerTypeProductPrice {
  id: string;
  customerTypeId: string;
  productId: string;
  productName: string;
  rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerType {
  id: string;
  name: string;
  category: CustomerTypeCategory;
  pickupPointId?: string | null;
  pickupPointName?: string | null;
  created_at?: string;
  updated_at?: string;
  prices?: CustomerTypeProductPrice[];
}
