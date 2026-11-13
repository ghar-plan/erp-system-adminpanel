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
  saleId: string;
  amount: string;
  entryDate: string;
  enteredBy: string;
  paymentSource: string;
  mediaId: string;
  receiptUrl: string;
}

interface OutstandingSale {
  id: string;
  label: string;
  balance: number;
  payment: number;
  total: number;
}

interface CashInFormProps {
  sales: OutstandingSale[];
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
      saleId: "",
      amount: "",
      entryDate: todayInput(),
      enteredBy: loggedInName,
      paymentSource: "",
      mediaId: "",
      receiptUrl: "",
    },
  });

  const saleId = watch("saleId");
  const receiptUrl = watch("receiptUrl");
  const selected = sales.find((s) => s.id === saleId);
  const fullAmount = Number(selected?.balance || 0);

  useEffect(() => {
    if (loggedInName) {
      setValue("enteredBy", loggedInName, { shouldValidate: true });
    }
  }, [loggedInName, setValue]);

  useEffect(() => {
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
    if (fullAmount <= 0) {
      errorToaster("This customer type has no remaining balance");
      return;
    }
    await onSubmit({
      ...data,
      amount: String(fullAmount),
      enteredBy: loggedInName || data.enteredBy,
    });
    reset({
      saleId: "",
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
            Receive the full remaining balance for a customer type
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
            {...register("saleId", {
              required: "Customer type is required",
            })}
          >
            <option value="">Select Customer Type</option>
            {sales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.saleId && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {errors.saleId.message}
            </p>
          )}
          {selected ? (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Paid {Number(selected.payment || 0).toLocaleString()} · Due{" "}
              {Number(selected.balance || 0).toLocaleString()} · Total{" "}
              {Number(selected.total || 0).toLocaleString()}
              {fullAmount === 0 ? " — nothing left to receive" : ""}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block ui-form-label">AMOUNT (PKR)</label>
          <div className="h-10 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <span>
              {fullAmount > 0
                ? `PKR ${fullAmount.toLocaleString()}`
                : "Full balance"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 uppercase tracking-wide">
              Full Payment
            </span>
          </div>
          <input type="hidden" {...register("amount")} />
          <p className="mt-1 text-[11px] text-muted-foreground">
            The full remaining balance is received.
          </p>
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
