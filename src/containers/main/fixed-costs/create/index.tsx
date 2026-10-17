import React, { useEffect, useRef, useState } from "react";
import { PlusSquare, Loader2, Save, Upload, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useFixedCosts from "../useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  FixedCostCategory,
  FixedCostPaymentType,
  FIXED_COST_CATEGORY_OPTIONS,
  FIXED_COST_PAYMENT_TYPE_OPTIONS,
} from "@/utils/helpers/models/fixed-costs/fixed-cost.dto";
import { errorToaster } from "@/utils/helpers/common/alert-service";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";

interface FixedCostFormInputs {
  category: FixedCostCategory | "";
  paymentType: FixedCostPaymentType | "";
  amount: number | string;
  date: string;
  remarks: string;
  mediaId: string;
  imageUrl: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const isImageUrl = (url?: string) =>
  !!url && /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);

export default function FixedCostCreate() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { createFixedCost, getFixedCostById, updateFixedCost, uploadImage } =
    useFixedCosts();
  const { isLoading } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FixedCostFormInputs>({
    defaultValues: {
      category: "",
      paymentType: "",
      amount: "",
      date: today(),
      remarks: "",
      mediaId: "",
      imageUrl: "",
    },
  });

  const mediaId = watch("mediaId");
  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (isEditMode && id) {
      getFixedCostById(id, (data: any) => {
        const existingUrl = data?.media?.url
          ? getFilePathWithBackendUrl(data.media.url)
          : "";
        reset({
          category: data?.category || "",
          paymentType: data?.paymentType || "",
          amount: data?.amount ?? "",
          date: data?.date ? String(data.date).slice(0, 10) : today(),
          remarks: data?.remarks || "",
          mediaId: data?.mediaId || data?.media?.id || "",
          imageUrl: existingUrl,
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      errorToaster("Image must not be greater than 10 MB");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    const mediaObj = await uploadImage(file);
    if (mediaObj) {
      setValue("mediaId", mediaObj.id, { shouldDirty: true });
      setValue(
        "imageUrl",
        mediaObj.url
          ? getFilePathWithBackendUrl(mediaObj.url)
          : URL.createObjectURL(file),
        { shouldDirty: true },
      );
    }
    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmitForm = async (data: FixedCostFormInputs) => {
    const payload: Record<string, any> = {
      category: data.category,
      paymentType: data.paymentType,
      amount: Number(data.amount),
      date: data.date,
      ...(data.remarks ? { remarks: data.remarks.trim() } : {}),
    };

    if (data.mediaId?.trim()) {
      payload.mediaId = data.mediaId.trim();
    }

    if (isEditMode && id) {
      await updateFixedCost(id, payload);
    } else {
      await createFixedCost(payload);
    }
  };

  const goToBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToBack}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <h1 className="text-2xl text-foreground font-bold">
            {isEditMode ? "Edit Fixed Cost" : "Record Fixed Cost"}
          </h1>
        </div>
      </div>

      <form
        id="fixed-cost-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="mb-2 block ui-form-label">Category</label>
            <select
              className={`common-input bg-card ${errors.category ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("category", { required: "Category is required" })}
            >
              <option value="">Select Category</option>
              {FIXED_COST_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Payment Type</label>
            <select
              className={`common-input bg-card ${errors.paymentType ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("paymentType", {
                required: "Payment type is required",
              })}
            >
              <option value="">Select Payment Type</option>
              {FIXED_COST_PAYMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.paymentType && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.paymentType.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 50000"
              className={`common-input ${errors.amount ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
                min: { value: 0.01, message: "Amount must be greater than 0" },
              })}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Date</label>
            <input
              type="date"
              className={`common-input ${errors.date ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.date.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block ui-form-label">
              Image <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <input type="hidden" {...register("mediaId")} />
            <label className="block cursor-pointer group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploadingImage}
              />
              <div className="relative w-full min-h-[96px] rounded-xl border-2 border-dashed border-border-input hover:border-primary/50 flex items-center justify-center text-center p-4 transition-all duration-200 overflow-hidden bg-bg-input/50">
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                    <Loader2 className="animate-spin text-primary" size={22} />
                    <span className="text-xs font-semibold">Uploading...</span>
                  </div>
                ) : imageUrl && isImageUrl(imageUrl) ? (
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={imageUrl}
                      alt="Fixed cost preview"
                      className="h-16 w-16 rounded-md object-cover border border-border-main shrink-0"
                    />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        Image attached
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Click to replace (PNG, JPG, PDF up to 10MB)
                      </p>
                    </div>
                  </div>
                ) : imageUrl || mediaId ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-16 w-16 rounded-md border border-border-main bg-muted-foreground/5 flex items-center justify-center shrink-0">
                      <FileText size={22} className="text-primary" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        File attached
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
                    <p className="text-xs font-semibold text-foreground">
                      Upload image
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block ui-form-label">Remarks</label>
            <textarea
              placeholder="e.g. October warehouse rent"
              rows={3}
              className="common-input py-3 resize-none"
              {...register("remarks")}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border-main/60">
          <button
            type="submit"
            disabled={isLoading || uploadingImage}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                {isEditMode ? <Save size={18} /> : <PlusSquare size={18} />}
                {isEditMode ? "Save Changes" : "Record Fixed Cost"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
