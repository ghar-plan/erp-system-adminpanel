export enum DocumentType {
  QUOTATION = "quotation",
  BILL = "bill",
}

export interface DocumentItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  lineTotal?: number;
  sortOrder?: number;
}

export interface ErpDocument {
  id: string;
  type: DocumentType;
  documentNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  total: number;
  remarks?: string | null;
  items?: DocumentItem[];
  created_at?: string;
  updated_at?: string;
}

export const documentTypeLabel = (type?: string | null): string => {
  switch (type) {
    case DocumentType.BILL:
      return "Bill";
    case DocumentType.QUOTATION:
      return "Quotation";
    default:
      return type || "--";
  }
};

export const generateDocumentNo = (type: DocumentType): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const pick = (str: string, n: number) =>
    Array.from({ length: n }, () => str[Math.floor(Math.random() * str.length)]).join(
      "",
    );
  const letterCount = 2 + Math.floor(Math.random() * 2);
  const digitCount = 4 - letterCount;
  const prefix = type === DocumentType.BILL ? "ERP-B" : "ERP-Q";
  return `${prefix}-${pick(letters, letterCount)}${pick(digits, digitCount)}`;
};

export const computeDocumentLineTotal = (
  quantity: number | string,
  rate: number | string,
): number => {
  const qty = Number(quantity) || 0;
  const r = Number(rate) || 0;
  return Math.round(qty * r * 100) / 100;
};

export const computeDocumentTotal = (
  items: Array<{ quantity?: number | string; rate?: number | string }>,
): number =>
  Math.round(
    items.reduce(
      (sum, item) =>
        sum + computeDocumentLineTotal(item.quantity ?? 0, item.rate ?? 0),
      0,
    ) * 100,
  ) / 100;
