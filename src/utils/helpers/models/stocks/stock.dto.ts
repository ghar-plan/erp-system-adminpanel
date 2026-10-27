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

/** FIFO lot for a product (oldest purchaseDate is sold first). */
export interface StockBatch {
  id: string;
  productId: string;
  productName: string;
  purchaseId: string | null;
  purchaseDate: string;
  expiryDate: string | null;
  quantity: number;
  remainingQuantity: number;
  /** Snapshot of purchase per-item rate when this batch was received. */
  rate?: number | null;
  created_at?: string;
  updated_at?: string;
}
