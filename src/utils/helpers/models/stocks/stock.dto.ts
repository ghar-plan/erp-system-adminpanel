export interface Stock {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPurchased: number;
  totalSold: number;
  created_at?: string;
  updated_at?: string;
}

export interface StockAvailability {
  productId: string;
  productName: string | null;
  quantity: number;
  totalPurchased: number;
  totalSold: number;
  exists: boolean;
}
