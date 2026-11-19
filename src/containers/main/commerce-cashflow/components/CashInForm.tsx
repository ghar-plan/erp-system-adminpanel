import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowDownCircle, Coins, FileText, Loader2, Upload } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getLoggedInUserDisplayName } from "@/utils/helpers/common/logged-in-user";
import { CASH_IN_PAYMENT_SOURCE_OPTIONS } from "@/utils/helpers/models/cashflow/cashflow.dto";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { errorToaster } from "@/utils/helpers/common/alert-service";
import useCommerceCashflow from "../useHooks";

export interface CommerceCashInFormInputs {
  customerTypeId: string;
  amount: string;
  entryDate: string;
  enteredBy: string;
  paymentSource: string;
  mediaId: string;
  receiptUrl: string;
}

interface CashInCustomerType {
  id: string;
  label: string;
  name?: string;
  categoryLabel?: string;
  balance: number;
  payment: number;
  total: number;
  advanceBalance?: number;
}

interface CashInFormProps {
  sales: CashInCustomerType[];
  onSubmit: (data: CommerceCashInFormInputs) => Promise<void>;
  submitting: boolean;
}

const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const isImageReceipt = (url?: string) =>
  !!url && /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);

export default function CashInForm({
  sales,
  onSubmit,
  submitting,
}: CashInFormProps) {
  const storeUser = useAppSelector((state) => state.sharedReducer.userData);
  const loggedInName = getLoggedInUserDisplayName(storeUser);
  const { uploadReceipt } = useCommerceCashflow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CommerceCashInFormInputs>({
    defaultValues: {
      customerTypeId: "",
      amount: "",
      entryDate: todayInput(),
      enteredBy: loggedInName,
      paymentSource: "",
      mediaId: "",
      receiptUrl: "",
    },
  });

  const customerTypeId = watch("customerTypeId");
  const amountWatch = watch("amount");
  const receiptUrl = watch("receiptUrl");
  const selected = sales.find((s) => s.id === customerTypeId);
  const fullAmount = Number(selected?.balance || 0);
  const existingAdvance = Number(selected?.advanceBalance || 0);
  const enteredAmountNum = Number(amountWatch);
  const settlePreview =
    Number.isFinite(enteredAmountNum) && enteredAmountNum > 0
      ? Math.min(enteredAmountNum, fullAmount)
      : 0;
  const advancePreview =
    Number.isFinite(enteredAmountNum) && enteredAmountNum > fullAmount
      ? Math.round((enteredAmountNum - fullAmount) * 100) / 100
      : 0;

  useEffect(() => {
    if (loggedInName) {
      setValue("enteredBy", loggedInName, { shouldValidate: true });
    }
  }, [loggedInName, setValue]);

  useEffect(() => {
    // Prefill with remaining due; admin can change the amount.
    setValue("amount", fullAmount > 0 ? String(fullAmount) : "");
  }, [selected?.id, fullAmount, setValue]);

  const handleReceiptChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      errorToaster("Receipt must be 10MB or less");
      return;
    }
    setUploadingReceipt(true);
    const mediaObj = await uploadReceipt(file);
    setUploadingReceipt(false);
    if (mediaObj?.id) {
      setValue("mediaId", mediaObj.id);
      setValue(
        "receiptUrl",
        getFilePathWithBackendUrl(mediaObj.url || mediaObj.path || ""),
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = async (data: CommerceCashInFormInputs) => {
    if (!data.customerTypeId) {
      errorToaster("Select a customer type");
      return;
    }
    const enteredAmount = Number(data.amount);
    if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) {
      errorToaster("Enter a valid amount greater than 0");
      return;
    }
    await onSubmit({
      ...data,
      amount: String(enteredAmount),
      enteredBy: loggedInName || data.enteredBy,
    });
    reset({
      customerTypeId: "",
      amount: "",
      entryDate: todayInput(),
      enteredBy: loggedInName,
      paymentSource: "",
      mediaId: "",
      receiptUrl: "",
    });
  };

  return (
    <div className="border-l-[5px] border-emerald-500 rounded-xl bg-card shadow-xs border p-6 space-y-6 overflow-visible">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <ArrowDownCircle size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Cash In</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter the amount received for a customer type
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div>
          <label className="mb-2 block ui-form-label">
            SELECT CUSTOMER TYPE
          </label>
          <select
            className="common-input cursor-pointer"
            {...register("customerTypeId", {
              required: "Customer type is required",
            })}
          >
            <option value="">Select Customer Type</option>
            {sales.map((s) => {
              const optionLabel =
                s.name && s.categoryLabel
                  ? `${s.name} (${s.categoryLabel})`
                  : s.label;
              return (
                <option key={s.id} value={s.id}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
          {errors.customerTypeId && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {errors.customerTypeId.message}
            </p>
          )}
          {selected ? (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Paid {Number(selected.payment || 0).toLocaleString()} · Due{" "}
              {Number(selected.balance || 0).toLocaleString()} · Total{" "}
              {Number(selected.total || 0).toLocaleString()}
              {existingAdvance > 0
                ? ` · Advance ${existingAdvance.toLocaleString()}`
                : ""}
              {fullAmount === 0
                ? " — no open due; amount will be stored as advance"
                : ""}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block ui-form-label">
            AMOUNT (PKR) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter Amount"
            className="common-input"
            {...register("amount", {
              required: "Amount is required",
              validate: (value) => {
                const amount = Number(value);
                if (!Number.isFinite(amount) || amount <= 0) {
                  return "Enter an amount greater than 0";
                }
                return true;
              },
            })}
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {errors.amount.message}
            </p>
          )}
          {selected && Number.isFinite(enteredAmountNum) && enteredAmountNum > 0 ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {settlePreview > 0
                ? `Settles due PKR ${settlePreview.toLocaleString()}`
                : "No open due"}
              {advancePreview > 0
                ? ` · Stores advance PKR ${advancePreview.toLocaleString()} for future sales`
                : ""}
            </p>
          ) : fullAmount > 0 ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Remaining due: PKR {fullAmount.toLocaleString()}. Extra amount is
              kept as customer advance.
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 grid-cols-1">
          <div>
            <label className="mb-2 block ui-form-label">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="common-input"
              {...register("entryDate", { required: "Date is required" })}
            />
          </div>
          <div>
            <label className="mb-2 block ui-form-label">
              Entered By <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              tabIndex={-1}
              value={loggedInName}
              className="common-input bg-muted-foreground/10 cursor-not-allowed"
            />
            <input type="hidden" {...register("enteredBy")} />
          </div>
        </div>

        <div>
          <label className="mb-2 block ui-form-label">
            Source of Payment <span className="text-red-500">*</span>
          </label>
          <select
            className="common-input cursor-pointer"
            {...register("paymentSource", {
              required: "Source of Payment is required",
            })}
          >
            <option value="" disabled>
              Select Source of Payment
            </option>
            {CASH_IN_PAYMENT_SOURCE_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          {errors.paymentSource && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {errors.paymentSource.message}
            </p>
          )}
        </div>

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
                    alt="Receipt"
                    className="h-16 w-16 rounded-md object-cover border border-border-main shrink-0"
                  />
                  <div className="text-left">
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
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground">
                      Receipt attached
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
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 px-6 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <Coins size={16} />
              RECORD CASH IN
            </>
          )}
        </button>
      </form>
    </div>
  );
}
