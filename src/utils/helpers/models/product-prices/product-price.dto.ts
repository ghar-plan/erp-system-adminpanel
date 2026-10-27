export interface ProductPrice {
  id: string;
  productId: string;
  productName: string;
  rate: number;
  effectiveFrom: string | Date;
  created_at?: string;
  updated_at?: string;
}

export interface ProductPriceHistory {
  id: string;
  productId: string;
  productName: string;
  rate: number;
  effectiveFrom: string | Date;
  effectiveTo?: string | Date | null;
  created_at?: string;
}
