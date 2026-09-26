import React, { useRef, useState, useEffect } from "react";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FileText, Loader2, Upload, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import {
  CASH_OUT_PAYMENT_SOURCE_OPTIONS,
  CASH_IN_PAYMENT_SOURCE_OPTIONS,
  CashOutPaymentSource,
  PaymentSource,
  TransactionStatus,
  TRANSACTION_STATUS_OPTIONS,
} from "@/utils/helpers/models/cashflow/cashflow.dto";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { errorToaster } from "@/utils/helpers/common/alert-service";
import useCashflow from "../useHooks";

interface PaymentDetailsFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  narrow?: boolean;
  employees?: Array<{ id: string; name: string }>;
  isCashOut?: boolean;
  totalAmount?: number;
}

const getErrorMessage = (error: unknown): string | undefined => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
};

const isImageReceipt = (url?: string) =>
  !!url && /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);

export const emptyPaymentDetails = {
  entryDate: "",
  enteredBy: "",
  paymentSource: "",
  status: TransactionStatus.PENDING,
  paidAmount: "",
  remainingAmount: "",
  chequeNo: "",
  transactionId: "",
  mediaId: "",
  receiptUrl: "",
};

const toDateInputValue = (value?: string | Date | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 10);
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const mapPaymentDetailsFromEdit = (editData: any) => ({
  entryDate: toDateInputValue(editData?.date || editData?.entryDate),
  enteredBy: editData?.enteredBy || "",
  paymentSource: editData?.paymentSource || "",
  status:
    editData?.status ||
    (editData?.paymentSource === CashOutPaymentSource.CREDIT ||
    editData?.paymentSource === CashOutPaymentSource.PARTIAL
      ? TransactionStatus.PENDING
      : TransactionStatus.RESOLVED),
  paidAmount:
    editData?.paidAmount !== null && editData?.paidAmount !== undefined
      ? String(editData.paidAmount)
      : "",
  remainingAmount:
    editData?.remainingAmount !== null && editData?.remainingAmount !== undefined
      ? String(editData.remainingAmount)
      : "",
  chequeNo: editData?.chequeNo || "",
  transactionId: editData?.transactionId || "",
  mediaId: editData?.mediaId || editData?.media?.id || "",
  receiptUrl: (() => {
    const url = editData?.receiptUrl || editData?.media?.url;
    return url ? getFilePathWithBackendUrl(url) : "";
  })(),
});

export default function PaymentDetailsFields({
  register,
  errors,
  watch,
  setValue,
  narrow = false,
  employees = [],
  isCashOut = false,
  totalAmount = 0,
}: PaymentDetailsFieldsProps) {
  const paymentSource = watch("paymentSource");
  const status = watch("status");
  const paidAmount = watch("paidAmount");
  const remainingAmount = watch("remainingAmount");
  const receiptUrl = watch("receiptUrl");
  const { uploadReceipt } = useCashflow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Auto calculate remainingAmount and suggest status when paidAmount or totalAmount or paymentSource changes for Cash Out
  useEffect(() => {
    if (!isCashOut) return;

    if (paymentSource === CashOutPaymentSource.PARTIAL) {
      const paid = Number(paidAmount) || 0;
      const total = Number(totalAmount) || 0;
      const remaining = Math.max(0, total - paid);
      setValue("remainingAmount", remaining ? String(remaining.toFixed(2)) : "0.00");
      if (paid > 0 && remaining <= 0) {
        setValue("status", TransactionStatus.RESOLVED);
      } else {
        setValue("status", TransactionStatus.PENDING);
      }
    } else if (paymentSource === CashOutPaymentSource.CREDIT) {
      const total = Number(totalAmount) || 0;
      setValue("paidAmount", "0");
      setValue("remainingAmount", total ? String(total.toFixed(2)) : "0.00");
      setValue("status", TransactionStatus.PENDING);
    } else if (
      paymentSource === CashOutPaymentSource.CASH ||
      paymentSource === CashOutPaymentSource.ADVANCE
    ) {
      const total = Number(totalAmount) || 0;
      setValue("paidAmount", total ? String(total.toFixed(2)) : "");
      setValue("remainingAmount", "0.00");
      setValue("status", TransactionStatus.RESOLVED);
    }
  }, [paymentSource, paidAmount, totalAmount, isCashOut, setValue]);

  const handleReceiptChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      errorToaster("Receipt file must not be greater than 10 MB");
      e.target.value = "";
      return;
    }

    setUploadingReceipt(true);
    const mediaObj = await uploadReceipt(file);
    if (mediaObj) {
      setValue("mediaId", mediaObj.id, { shouldDirty: true });
      setValue(
        "receiptUrl",
        mediaObj.url
          ? getFilePathWithBackendUrl(mediaObj.url)
          : URL.createObjectURL(file),
        { shouldDirty: true },
      );
    }
    setUploadingReceipt(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const paymentOptions = isCashOut
    ? CASH_OUT_PAYMENT_SOURCE_OPTIONS
    : CASH_IN_PAYMENT_SOURCE_OPTIONS;

  return (
    <>
      <div className={`grid gap-5 grid-cols-1 ${narrow ? "" : "md:grid-cols-2"}`}>
        <div>
          <label className="mb-2 block ui-form-label">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={`common-input ${errors.entryDate ? "border-red-500 focus:border-red-500" : ""}`}
            {...register("entryDate", { required: "Date is required" })}
          />
          {getErrorMessage(errors.entryDate) && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {getErrorMessage(errors.entryDate)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block ui-form-label">
            Entered By <span className="text-red-500">*</span>
          </label>
          <select
            className={`common-input cursor-pointer ${errors.enteredBy ? "border-red-500 focus:border-red-500" : ""}`}
            {...register("enteredBy", { required: "Entered By is required" })}
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.name}>
                {emp.name}
              </option>
            ))}
          </select>
          {getErrorMessage(errors.enteredBy) && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {getErrorMessage(errors.enteredBy)}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block ui-form-label">
          Source of Payment <span className="text-red-500">*</span>
        </label>
        <select
          className={`common-input cursor-pointer ${errors.paymentSource ? "border-red-500 focus:border-red-500" : ""}`}
          {...register("paymentSource", {
            required: "Source of Payment is required",
            onChange: (e) => {
              const val = e.target.value;
              if (val !== PaymentSource.CHEQUE) {
                setValue("chequeNo", "");
              }
              if (val !== PaymentSource.ONLINE_TRANSFER) {
                setValue("transactionId", "");
              }
              if (val !== CashOutPaymentSource.PARTIAL) {
                setValue("paidAmount", "");
              }
            },
          })}
        >
          <option value="" disabled>
            Select Source of Payment
          </option>
          {paymentOptions.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        {getErrorMessage(errors.paymentSource) && (
          <p className="mt-1 text-xs text-danger-text font-semibold">
            {getErrorMessage(errors.paymentSource)}
          </p>
        )}
      </div>

      {/* When Partial is selected in Cash Out */}
      {isCashOut && paymentSource === CashOutPaymentSource.PARTIAL && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wide">
            <Clock size={16} />
            <span>Partial Payment Details</span>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
                Paid / First Installment (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 30000"
                className={`common-input bg-card ${errors.paidAmount ? "border-red-500" : ""}`}
                {...register("paidAmount", {
                  required:
                    paymentSource === CashOutPaymentSource.PARTIAL
                      ? "Paid amount is required for partial payment"
                      : false,
                  min: {
                    value: 0.01,
                    message: "Paid amount must be greater than 0",
                  },
                  validate: (val) => {
                    if (paymentSource === CashOutPaymentSource.PARTIAL) {
                      const num = Number(val);
                      if (totalAmount > 0 && num > totalAmount) {
                        return `Paid amount cannot exceed total decided amount (PKR ${totalAmount.toLocaleString()})`;
                      }
                    }
                    return true;
                  },
                })}
              />
              {getErrorMessage(errors.paidAmount) && (
                <p className="mt-1 text-xs text-danger-text font-semibold">
                  {getErrorMessage(errors.paidAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
                Remaining Balance (PKR)
              </label>
              <input
                type="text"
                readOnly
                tabIndex={-1}
                value={
                  remainingAmount !== undefined && remainingAmount !== ""
                    ? `PKR ${Number(remainingAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "--"
                }
                className="common-input bg-muted-foreground/10 text-foreground font-bold cursor-not-allowed"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Auto-calculated (Total PKR {totalAmount.toLocaleString()} &minus; Paid PKR {Number(paidAmount || 0).toLocaleString()})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* When Credit is selected in Cash Out */}
      {isCashOut && paymentSource === CashOutPaymentSource.CREDIT && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5 animate-fade-in">
          <AlertCircle size={17} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Credit Transaction</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Total decided amount of <strong>PKR {totalAmount.toLocaleString()}</strong> will be recorded on credit with remaining balance of <strong>PKR {totalAmount.toLocaleString()}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Legacy Cheque & Online Transfer fields for Cash In */}
      {!isCashOut && paymentSource === PaymentSource.CHEQUE && (
        <div>
          <label className="mb-2 block ui-form-label">
            Cheque No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter cheque number"
            className={`common-input ${errors.chequeNo ? "border-red-500 focus:border-red-500" : ""}`}
            {...register("chequeNo", {
              required:
                paymentSource === PaymentSource.CHEQUE
                  ? "Cheque No is required"
                  : false,
            })}
          />
          {getErrorMessage(errors.chequeNo) && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {getErrorMessage(errors.chequeNo)}
            </p>
          )}
        </div>
      )}

      {!isCashOut && paymentSource === PaymentSource.ONLINE_TRANSFER && (
        <div>
          <label className="mb-2 block ui-form-label">
            Transaction ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter transaction ID"
            className={`common-input ${errors.transactionId ? "border-red-500 focus:border-red-500" : ""}`}
            {...register("transactionId", {
              required:
                paymentSource === PaymentSource.ONLINE_TRANSFER
                  ? "Transaction ID is required"
                  : false,
            })}
          />
          {getErrorMessage(errors.transactionId) && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {getErrorMessage(errors.transactionId)}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block ui-form-label">Upload Receipt</label>
        <label className="block cursor-pointer group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
            onChange={handleReceiptChange}
            className="hidden"
            disabled={uploadingReceipt}
          />
          <div className="relative w-full min-h-[96px] rounded-xl border-2 border-dashed border-border-input hover:border-primary/50 flex items-center justify-center text-center p-4 transition-all duration-200 overflow-hidden bg-bg-input/50">
            {uploadingReceipt ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                <Loader2 className="animate-spin text-primary" size={22} />
                <span className="text-xs font-semibold">Uploading...</span>
              </div>
            ) : receiptUrl && isImageReceipt(receiptUrl) ? (
              <div className="flex items-center gap-3 w-full">
                <img
                  src={receiptUrl}
                  alt="Payment receipt preview"
                  className="h-16 w-16 rounded-md object-cover border border-border-main shrink-0"
                />
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-foreground">
                    Receipt attached
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Click to replace (PNG, JPG, PDF up to 10MB)
                  </p>
                </div>
              </div>
            ) : receiptUrl ? (
              <div className="flex items-center gap-3 w-full">
                <div className="h-16 w-16 rounded-md border border-border-main bg-muted-foreground/5 flex items-center justify-center shrink-0">
                  <FileText size={22} className="text-primary" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-foreground">
                    Receipt attached
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Click to replace (PNG, JPG, PDF up to 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload
                  size={22}
                  className="text-muted-foreground group-hover:text-primary transition-colors duration-200 mb-1.5 stroke-[1.5]"
                />
                <span className="text-xs font-bold text-foreground">
                  Upload Receipt
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  Optional · PNG, JPG, PDF up to 10MB
                </span>
              </div>
            )}
          </div>
        </label>
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
          >
            View receipt
          </a>
        )}
      </div>
    </>
  );
}
