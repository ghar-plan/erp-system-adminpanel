import React, { useEffect, useRef, useState } from "react";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FileText, Loader2, Upload } from "lucide-react";
import {
  PAYMENT_SOURCE_OPTIONS,
  PaymentSource,
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
  chequeNo: editData?.chequeNo || "",
  transactionId: editData?.transactionId || "",
  mediaId: editData?.mediaId || editData?.media?.id || "",
  receiptUrl: (() => {
    const url = editData?.receiptUrl || editData?.media?.url;
    return url ? getFilePathWithBackendUrl(url) : "";
  })(),
});

function highlightSuggestion(name: string, query: string) {
  const needle = query.trim();
  if (!needle) return name;
  const start = name.toLowerCase().indexOf(needle.toLowerCase());
  if (start < 0) return name;
  const end = start + needle.length;
  return (
    <>
      {name.slice(0, start)}
      <span className="text-muted-foreground">{name.slice(start, end)}</span>
      <span className="font-semibold text-foreground">{name.slice(end)}</span>
    </>
  );
}

export default function PaymentDetailsFields({
  register,
  errors,
  watch,
  setValue,
  narrow = false,
}: PaymentDetailsFieldsProps) {
  const paymentSource = watch("paymentSource");
  const receiptUrl = watch("receiptUrl");
  const enteredBy = watch("enteredBy") || "";
  const { uploadReceipt, suggestEnteredBy } = useCashflow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const enteredByWrapRef = useRef<HTMLDivElement>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const enteredByRegister = register("enteredBy", {
    required: "Entered By is required",
  });

  useEffect(() => {
    const query = String(enteredBy).trim();
    if (!showSuggestions || query.length < 1) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const names = await suggestEnteredBy(query);
      if (cancelled) return;
      setSuggestions(names.filter((name) => name.toLowerCase() !== query.toLowerCase()));
      setActiveIndex(-1);
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enteredBy, showSuggestions]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!enteredByWrapRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const applySuggestion = (name: string) => {
    setValue("enteredBy", name, { shouldDirty: true, shouldValidate: true });
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveIndex(-1);
  };

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

        <div ref={enteredByWrapRef} className="relative z-20 overflow-visible">
          <label className="mb-2 block ui-form-label">
            Entered By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            autoComplete="off"
            placeholder="Who is entering this record"
            className={`common-input ${errors.enteredBy ? "border-red-500 focus:border-red-500" : ""}`}
            {...enteredByRegister}
            onFocus={() => {
              if (String(enteredBy).trim()) setShowSuggestions(true);
            }}
            onChange={(event) => {
              enteredByRegister.onChange(event);
              setShowSuggestions(true);
            }}
            onKeyDown={(event) => {
              if (!showSuggestions || !suggestions.length) {
                if (event.key === "Escape") setShowSuggestions(false);
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((index) =>
                  index < suggestions.length - 1 ? index + 1 : 0,
                );
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) =>
                  index > 0 ? index - 1 : suggestions.length - 1,
                );
              } else if (event.key === "Enter" && activeIndex >= 0) {
                event.preventDefault();
                applySuggestion(suggestions[activeIndex]);
              } else if (event.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%-2px)] z-50 rounded-lg border border-border-main bg-card shadow-xl">
              <ul className="max-h-52 overflow-y-auto py-1">
                {suggestions.map((name, index) => (
                  <li key={name}>
                    <button
                      type="button"
                      className={`flex w-full cursor-pointer items-center px-3.5 py-2.5 text-left text-sm leading-5 ${
                        index === activeIndex
                          ? "bg-primary/10 text-foreground"
                          : "hover:bg-muted-foreground/5 text-foreground"
                      }`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        applySuggestion(name);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span className="block w-full truncate">
                        {highlightSuggestion(name, String(enteredBy))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
              if (e.target.value !== PaymentSource.CHEQUE) {
                setValue("chequeNo", "");
              }
              if (e.target.value !== PaymentSource.ONLINE_TRANSFER) {
                setValue("transactionId", "");
              }
            },
          })}
        >
          <option value="" disabled>
            Select Source of Payment
          </option>
          {PAYMENT_SOURCE_OPTIONS.map((source) => (
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

      {paymentSource === PaymentSource.CHEQUE && (
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

      {paymentSource === PaymentSource.ONLINE_TRANSFER && (
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
