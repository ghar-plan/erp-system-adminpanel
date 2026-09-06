export enum PaymentSource {
  CASH = "Cash",
  CHEQUE = "Cheque",
  ONLINE_TRANSFER = "Online Transfer",
}

export const PAYMENT_SOURCE_OPTIONS = Object.values(PaymentSource);

export const buildPaymentDetailsPayload = (data: {
  entryDate: string;
  enteredBy: string;
  paymentSource: string;
  chequeNo?: string;
  transactionId?: string;
  mediaId?: string;
}) => ({
  entryDate: data.entryDate,
  enteredBy: data.enteredBy.trim(),
  paymentSource: data.paymentSource,
  ...(data.paymentSource === PaymentSource.CHEQUE && data.chequeNo
    ? { chequeNo: data.chequeNo.trim() }
    : {}),
  ...(data.paymentSource === PaymentSource.ONLINE_TRANSFER && data.transactionId
    ? { transactionId: data.transactionId.trim() }
    : {}),
  ...(data.mediaId ? { mediaId: data.mediaId } : {}),
});
