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
    ? { paidAmount: Number(data.paidAmount) }
    : {}),
  ...(data.remainingAmount !== undefined && data.remainingAmount !== ""
    ? { remainingAmount: Number(data.remainingAmount) }
    : {}),
  ...(data.paymentSource === PaymentSource.CHEQUE && data.chequeNo
    ? { chequeNo: data.chequeNo.trim() }
    : {}),
  ...(data.paymentSource === PaymentSource.ONLINE_TRANSFER && data.transactionId
    ? { transactionId: data.transactionId.trim() }
    : {}),
  ...(data.mediaId ? { mediaId: data.mediaId } : {}),
});
