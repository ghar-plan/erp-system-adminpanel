export enum PaymentSource {
  CASH = "Cash",
  CHEQUE = "Cheque",
  ONLINE_TRANSFER = "Online Transfer",
  CREDIT = "Credit",
  PARTIAL = "Partial",
  ADVANCE = "Advance",
}

export enum CashOutPaymentSource {
  CREDIT = "Credit",
  PARTIAL = "Partial",
  CASH = "Cash",
  ADVANCE = "Advance",
}

export enum TransactionStatus {
  PENDING = "Pending",
  RESOLVED = "Resolved",
}

export const TRANSACTION_STATUS_OPTIONS: TransactionStatus[] = [
  TransactionStatus.PENDING,
  TransactionStatus.RESOLVED,
];

export const CASH_OUT_PAYMENT_SOURCE_OPTIONS = [
  CashOutPaymentSource.CREDIT,
  CashOutPaymentSource.PARTIAL,
  CashOutPaymentSource.CASH,
  CashOutPaymentSource.ADVANCE,
];

export const CASH_IN_PAYMENT_SOURCE_OPTIONS = [
  PaymentSource.CASH,
  PaymentSource.CHEQUE,
  PaymentSource.ONLINE_TRANSFER,
];

export const PAYMENT_SOURCE_OPTIONS = Object.values(PaymentSource);

/** Parse money from number/string (allows commas) and round to 2 decimal places. */
export const parseMoney = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value * 100) / 100 : NaN;
  }
  if (value === null || value === undefined) return NaN;
  const cleaned = String(value).replace(/,/g, "").trim();
  if (!cleaned) return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
};

/** Multiply two money/qty values using integer cents to avoid float drift. */
export const multiplyMoney = (a: unknown, b: unknown): number => {
  const aCents = Math.round(parseMoney(a) * 100);
  const bCents = Math.round(parseMoney(b) * 100);
  if (!Number.isFinite(aCents) || !Number.isFinite(bCents)) return NaN;
  // (aCents/100) * (bCents/100) = aCents * bCents / 10000 → round to cents
  return Math.round((aCents * bCents) / 100) / 100;
};

/** Divide money by qty using integer cents. */
export const divideMoney = (total: unknown, qty: unknown): number => {
  const totalCents = Math.round(parseMoney(total) * 100);
  const q = parseMoney(qty);
  if (!Number.isFinite(totalCents) || !Number.isFinite(q) || q === 0) return NaN;
  return Math.round(totalCents / q) / 100;
};

/** Format a money value as a fixed 2-decimal number for API payloads. */
export const toMoneyNumber = (value: unknown): number => {
  const n = parseMoney(value);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : NaN;
};

export const buildPaymentDetailsPayload = (data: {
  entryDate: string;
  enteredBy: string;
  paymentSource: string;
  status?: string;
  paidAmount?: string | number;
  remainingAmount?: string | number;
  chequeNo?: string;
  transactionId?: string;
  mediaId?: string;
}) => ({
  entryDate: data.entryDate,
  enteredBy: data.enteredBy.trim(),
  paymentSource: data.paymentSource,
  ...(data.status ? { status: data.status } : {}),
  ...(data.paidAmount !== undefined && data.paidAmount !== ""
    ? { paidAmount: parseMoney(data.paidAmount) }
    : {}),
  ...(data.remainingAmount !== undefined && data.remainingAmount !== ""
    ? { remainingAmount: parseMoney(data.remainingAmount) }
    : {}),
  ...(data.paymentSource === PaymentSource.CHEQUE && data.chequeNo
    ? { chequeNo: data.chequeNo.trim() }
    : {}),
  ...(data.paymentSource === PaymentSource.ONLINE_TRANSFER && data.transactionId
    ? { transactionId: data.transactionId.trim() }
    : {}),
  ...(data.mediaId ? { mediaId: data.mediaId } : {}),
});
